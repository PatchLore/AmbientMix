import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join, relative } from "path";
import { createFXFromFilename, categorizeFX } from "@/app/lib/soundfxLoader";

/**
 * Recursively scan directory for audio files
 */
async function scanDirectory(dirPath: string, basePath: string): Promise<string[]> {
  const audioFiles: string[] = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, basePath);
        audioFiles.push(...subFiles);
      } else if (entry.isFile()) {
        const name = entry.name.toLowerCase();
        if (name.endsWith(".wav") || name.endsWith(".mp3")) {
          // Get relative path from base soundfx directory
          const relativePath = relative(basePath, fullPath);
          audioFiles.push(relativePath);
        }
      }
    }
  } catch (error: any) {
    // Skip directories we can't read
    if (error.code !== "ENOENT") {
      console.warn(`Error scanning directory ${dirPath}:`, error.message);
    }
  }
  
  return audioFiles;
}

/**
 * API route to list all sound FX files in /public/soundfx
 * Scans the directory recursively and flattens nested folders
 */
export async function GET() {
  try {
    const soundfxDir = join(process.cwd(), "public", "soundfx");
    
    // Check if directory exists
    try {
      await stat(soundfxDir);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return NextResponse.json({
          fx: [],
          count: 0,
        });
      }
      throw error;
    }
    
    // Recursively scan for audio files (flattens nested folders)
    const audioFilePaths = await scanDirectory(soundfxDir, soundfxDir);
    
    // Create FX objects from filenames
    const audioFiles = audioFilePaths.map((filePath) => {
      // Extract filename (last part of path) for categorization
      const filename = filePath.split(/[/\\]/).pop() || filePath;
      const category = categorizeFX(filename);
      
      // Create FX object with proper URL path (preserves nested folder structure)
      const fxObj = createFXFromFilename(filename, category);
      
      return {
        name: fxObj.name,
        url: `/soundfx/${filePath.replace(/\\/g, "/")}`, // Normalize path separators, preserve nested paths
        category,
        filename: filename,
      };
    });

    return NextResponse.json({
      fx: audioFiles,
      count: audioFiles.length,
    });
  } catch (error: any) {
    console.error("Error reading soundfx directory:", error);
    return NextResponse.json(
      { error: "Failed to read sound FX directory", message: error.message },
      { status: 500 }
    );
  }
}

