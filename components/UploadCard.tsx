"use client";

import { useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";
import type { MainTrack } from "@/types/audio";
import { Waveform } from "@/components/Waveform";

interface UploadCardProps {
  onFileSelected: (file: File, duration: number) => void;
  mainTrack: MainTrack | null;
  loopStart?: number;
  loopEnd?: number;
  onRegionUpdate?: (start: number, end: number) => void;
}

interface ValidationError {
  message: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MIN_DURATION = 3; // 3 seconds

export function UploadCard({ 
  onFileSelected, 
  mainTrack,
  loopStart,
  loopEnd,
  onRegionUpdate,
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);

  const validateFile = useCallback((file: File): ValidationError | null => {
    // Check file type
    const isValidType = 
      file.type.match(/audio\/(mp3|wav|mpeg)/) || 
      file.name.match(/\.(mp3|wav)$/i);
    
    if (!isValidType) {
      return { message: "Please upload an MP3 or WAV file only." };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        message: `File size exceeds 50 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.` 
      };
    }

    return null;
  }, []);

  const getAudioDuration = useCallback(async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      
      audio.addEventListener("error", (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      });
      
      audio.src = url;
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsProcessing(true);
    try {
      const duration = await getAudioDuration(file);
      
      // Validate duration
      if (duration < MIN_DURATION) {
        setError({ 
          message: `Audio must be at least ${MIN_DURATION} seconds long. Your file is ${duration.toFixed(1)} seconds.` 
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      onFileSelected(file, duration);
    } catch (error) {
      console.error("Error processing audio:", error);
      setError({ message: "Failed to process audio file. Please try again." });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onFileSelected, getAudioDuration, validateFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [handleFile]
  );

  const handleReplaceClick = useCallback(() => {
    if (fileInputRef.current) {
      // Reset input value to ensure onChange fires even for same file
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1 - Upload</CardTitle>
        <CardDescription>Upload your main audio track (MP3 or WAV)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {!mainTrack ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}
              ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop your audio here or browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports MP3 and WAV files (up to 50 MB, minimum 3 seconds)
            </p>
            <Button variant="outline" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Browse Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-medium">{mainTrack.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(mainTrack.duration)} • {formatFileSize(mainTrack.size)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplaceClick}
              >
                Replace
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Waveform</h4>
              <Waveform 
                mainTrack={mainTrack}
                loopStart={loopStart}
                loopEnd={loopEnd}
                onRegionUpdate={onRegionUpdate}
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
