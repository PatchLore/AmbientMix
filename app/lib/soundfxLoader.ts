/**
 * Sound FX Loader Utility
 * Automatically scans and loads sound effects from /public/soundfx
 */

export interface SoundFX {
  name: string;
  url: string;
  category?: string;
  filename: string;
}

/**
 * Get list of available sound FX files
 * This function fetches from an API route that scans the /public/soundfx directory
 */
export async function getAvailableSoundFX(): Promise<SoundFX[]> {
  try {
    const response = await fetch("/api/soundfx/list");
    if (!response.ok) {
      console.warn("Failed to fetch sound FX list");
      return [];
    }
    const data = await response.json();
    return data.fx || [];
  } catch (error) {
    console.error("Error loading sound FX:", error);
    return [];
  }
}

/**
 * Generate FX object from filename
 */
export function createFXFromFilename(filename: string, category?: string): SoundFX {
  // Remove extension and format name
  const nameWithoutExt = filename.replace(/\.(wav|mp3)$/i, "");
  // Convert kebab-case or snake_case to Title Case
  const name = nameWithoutExt
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return {
    name,
    url: `/soundfx/${filename}`,
    category,
    filename,
  };
}

/**
 * Categorize FX based on filename patterns
 */
export function categorizeFX(filename: string): string {
  const lower = filename.toLowerCase();
  
  if (lower.includes("rain") || lower.includes("water")) return "Weather";
  if (lower.includes("thunder") || lower.includes("storm")) return "Weather";
  if (lower.includes("wind") || lower.includes("air")) return "Weather";
  if (lower.includes("fire") || lower.includes("crackle")) return "Fire";
  if (lower.includes("forest") || lower.includes("nature") || lower.includes("bird")) return "Nature";
  if (lower.includes("city") || lower.includes("urban") || lower.includes("traffic")) return "Urban";
  if (lower.includes("room") || lower.includes("tone") || lower.includes("ambient")) return "Ambient";
  
  return "Other";
}

