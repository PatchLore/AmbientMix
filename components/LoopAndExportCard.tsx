"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import type { MixerState } from "@/types/audio";
import { renderMix } from "@/lib/audio/renderMix";
import { previewMix } from "@/lib/audio/preview";

interface LoopAndExportCardProps {
  state: MixerState;
  onDurationChange: (duration: 10 | 30 | 60) => void;
}

export function LoopAndExportCard({
  state,
  onDurationChange,
}: LoopAndExportCardProps) {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreview = async () => {
    if (!state.mainTrack) {
      alert("Please upload a main track first");
      return;
    }

    setIsPreviewing(true);
    try {
      await previewMix(state);
    } catch (error) {
      console.error("Preview error:", error);
      alert("Failed to preview. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleRender = async () => {
    if (!state.mainTrack) {
      alert("Please upload a main track first");
      return;
    }

    const enabledLayers = state.ambienceLayers.filter((layer) => layer.enabled);
    if (enabledLayers.length === 0) {
      alert("Please enable at least one ambience layer");
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);

    try {
      // Load and prepare ambience layers
      console.log("Enabled layers:", enabledLayers);
      const thunderLayer = enabledLayers.find(l => l.type === "distant-thunder");
      console.log("Thunder layer:", thunderLayer);
      
      const ambienceLayers = await Promise.all(
        enabledLayers.map(async (layer) => {
          try {
            const filePath = `/ambience/${layer.type}.mp3`;
            console.log(`Loading ambience layer ${layer.id} (${layer.type}) from ${filePath}`);
            
            // Load ambience file
            const response = await fetch(filePath);
            if (!response.ok) {
              throw new Error(`Failed to load ${layer.type}.mp3 (HTTP ${response.status})`);
            }
            const blob = await response.blob();
            
            console.log(`Thunder file loaded: ${layer.type}`, {
              file: blob,
              size: blob.size,
              type: blob.type,
            });

            // Calculate lowpass frequency from warmth (0-100 -> 500-3000 Hz)
            const lowpassHz = 500 + (layer.warmth * 25);
            
            // For thunder, ensure we don't filter out too much low-frequency content
            // Thunder needs low frequencies, so if warmth is too high, use a higher cutoff
            const finalLowpassHz = layer.type === "distant-thunder" 
              ? Math.max(lowpassHz, 2000) // Ensure thunder has at least 2kHz pass
              : lowpassHz;

            const layerConfig = {
              id: layer.id,
              type: layer.type, // Pass through type for identification
              file: blob,
              enabled: true,
              volume: layer.volume / 100, // Convert 0-100 to 0-1
              lowpassHz: finalLowpassHz,
            };
            
            if (layer.type === "distant-thunder") {
              console.log(`Thunder layer config:`, {
                id: layerConfig.id,
                volume: layerConfig.volume,
                lowpassHz: layerConfig.lowpassHz,
                fileSize: blob.size,
              });
            }

            return layerConfig;
          } catch (error) {
            console.error(`Failed to load ambience layer ${layer.type}:`, error);
            throw new Error(`Failed to load ambience layer: ${layer.name}`);
          }
        })
      );

      console.log("Ambience layers prepared:", ambienceLayers);
      
      // Find thunder by matching with enabledLayers
      const thunderEnabled = enabledLayers.find(l => l.type === "distant-thunder");
      const thunderIndex = enabledLayers.findIndex(l => l.type === "distant-thunder");
      const thunderLayerPrepared = thunderIndex >= 0 ? ambienceLayers[thunderIndex] : null;
      console.log("Thunder layer prepared:", thunderLayerPrepared);
      if (thunderLayerPrepared) {
        console.log("Thunder layer details:", {
          id: thunderLayerPrepared.id,
          enabled: thunderLayerPrepared.enabled,
          volume: thunderLayerPrepared.volume,
          lowpassHz: thunderLayerPrepared.lowpassHz,
        });
      }

      await renderMix({
        durationSeconds: state.loopDuration * 60,
        mainTrack: state.mainTrack.file,
        ambienceLayers,
        onProgress: (progress) => {
          setRenderProgress(progress);
        },
      });

      setRenderProgress(100);
    } catch (error) {
      console.error("Render error:", error);
      alert(`Failed to render mix: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRendering(false);
      setTimeout(() => setRenderProgress(0), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3 - Loop & Export</CardTitle>
        <CardDescription>
          Choose duration and export your perfectly looped mix
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Loop Duration</Label>
          <div className="flex gap-2">
            {([10, 30, 60] as const).map((duration) => (
              <button
                key={duration}
                onClick={() => onDurationChange(duration)}
                className={`
                  flex-1 px-4 py-2 text-sm rounded-md border transition-colors
                  ${
                    state.loopDuration === duration
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-secondary border-input"
                  }
                `}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isPreviewing || isRendering || !state.mainTrack}
            className="flex-1"
          >
            {isPreviewing ? "Previewing..." : "Preview 30s"}
          </Button>
          <Button
            onClick={handleRender}
            disabled={isRendering || !state.mainTrack}
            className="flex-1"
          >
            {isRendering ? "Rendering..." : "Render & Download"}
          </Button>
        </div>

        {isRendering && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Rendering mix...</span>
              <span>{renderProgress}%</span>
            </div>
            <Progress value={renderProgress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

