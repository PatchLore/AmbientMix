"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSoundFX } from "@/app/hooks/useSoundFX";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Component to display and play available sound FX files
 */
export function SoundFXCard() {
  const { fx, loading, error } = useSoundFX();
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  const handlePlay = (url: string, name: string) => {
    // Stop any currently playing audio
    audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Create new audio element if it doesn't exist
    let audio = audioElements.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.addEventListener("ended", () => {
        setPlayingUrl(null);
      });
      setAudioElements((prev) => new Map(prev).set(url, audio!));
    }

    // Play or pause
    if (playingUrl === url && !audio.paused) {
      audio.pause();
      setPlayingUrl(null);
    } else {
      audio.play();
      setPlayingUrl(url);
    }
  };

  // Group FX by category
  const groupedFX = fx.reduce((acc, fxItem) => {
    const category = fxItem.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(fxItem);
    return acc;
  }, {} as Record<string, typeof fx>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
          <CardDescription>Loading available sound effects...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
          <CardDescription>Error loading sound effects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (fx.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
          <CardDescription>No sound effects available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add audio files (.wav or .mp3) to the <code className="text-xs bg-secondary px-1 py-0.5 rounded">/public/soundfx</code> folder to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sound Effects</CardTitle>
        <CardDescription>
          {fx.length} sound effect{fx.length !== 1 ? "s" : ""} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedFX).map(([category, categoryFX]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {categoryFX.map((fxItem) => (
                <div
                  key={fxItem.url}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-medium flex-1 truncate">{fxItem.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlay(fxItem.url, fxItem.name)}
                    className="ml-2"
                  >
                    <Play
                      className={`w-4 h-4 ${
                        playingUrl === fxItem.url ? "text-primary" : ""
                      }`}
                    />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

