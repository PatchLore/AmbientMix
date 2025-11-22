"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import type { MainTrack } from "@/types/audio";

interface WaveformProps {
  mainTrack: MainTrack | null;
  loopStart?: number;
  loopEnd?: number;
  onRegionUpdate?: (start: number, end: number) => void;
}

export function Waveform({ mainTrack, loopStart, loopEnd, onRegionUpdate }: WaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);

  useEffect(() => {
    if (!waveformRef.current || !mainTrack) return;

    let ws: WaveSurfer | null = null;
    let cancelled = false;
    const url = URL.createObjectURL(mainTrack.file);

    // Capture values at mount time
    const initialLoopStart = loopStart;
    const initialLoopEnd = loopEnd;
    const handleRegionUpdate = onRegionUpdate;

    // Use async IIFE to handle loading safely
    (async () => {
      try {
        // Check if cancelled before creating instance
        if (cancelled || !waveformRef.current) return;

        // Create WaveSurfer instance
        ws = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "hsl(var(--muted-foreground))",
          progressColor: "hsl(var(--primary))",
          cursorColor: "hsl(var(--primary))",
          barWidth: 2,
          barRadius: 1,
          height: 100,
          normalize: true,
        });

        // Check if cancelled before proceeding
        if (cancelled) {
          try {
            ws.destroy();
          } catch {
            // Ignore destroy errors
          }
          return;
        }

        // Add regions plugin
        const regions = ws.registerPlugin(RegionsPlugin.create());
        regionsRef.current = regions;
        wavesurferRef.current = ws;

        // Check if cancelled before loading
        if (cancelled) {
          try {
            ws.destroy();
          } catch {
            // Ignore destroy errors
          }
          wavesurferRef.current = null;
          regionsRef.current = null;
          return;
        }

        // Load audio file
        try {
          const loadResult = ws.load(url);
          await loadResult;
        } catch (loadError) {
          console.error("WaveSurfer load error:", loadError);
          if (ws) {
            try {
              ws.destroy();
            } catch {
              // Ignore destroy errors
            }
          }
          wavesurferRef.current = null;
          regionsRef.current = null;
          return;
        }

        // After load completes, check if cancelled
        if (cancelled) {
          if (ws) {
            try {
              ws.destroy();
            } catch {
              // Ignore destroy errors
            }
          }
          wavesurferRef.current = null;
          regionsRef.current = null;
          return;
        }

        // Only proceed if not cancelled
        if (!ws || cancelled) return;

        // Set initial region if provided
        if (initialLoopStart !== undefined && initialLoopEnd !== undefined) {
          try {
            regions.addRegion({
              start: initialLoopStart,
              end: initialLoopEnd,
              color: "rgba(59, 130, 246, 0.3)",
              drag: true,
              resize: true,
            });
          } catch (regionError) {
            console.warn("Failed to add initial region:", regionError);
          }
        }

        // Listen for region updates
        if (handleRegionUpdate) {
          regions.on("region-updated", (region) => {
            if (cancelled) return;
            try {
              handleRegionUpdate(region.start, region.end);
            } catch (updateError) {
              console.warn("Region update callback error:", updateError);
            }
          });
        }
      } catch (err) {
        console.error("WaveSurfer initialization error:", err);
        if (ws) {
          try {
            ws.destroy();
          } catch {
            // Ignore destroy errors
          }
        }
        wavesurferRef.current = null;
        regionsRef.current = null;
      }
    })();

    // Cleanup function - NEVER calls destroy() directly
    return () => {
      cancelled = true;

      // Clear refs
      wavesurferRef.current = null;
      regionsRef.current = null;

      // Only revoke object URL
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore URL revoke errors
      }
    };
    // Only re-run when mainTrack changes - loopStart/loopEnd handled in separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTrack]);

  // Update region if loopStart/loopEnd change (separate from initial load)
  useEffect(() => {
    if (!regionsRef.current || !wavesurferRef.current || loopStart === undefined || loopEnd === undefined) {
      return;
    }

    const wavesurfer = wavesurferRef.current;
    const regions = regionsRef.current;
    const currentLoopStart = loopStart;
    const currentLoopEnd = loopEnd;

    // Check if wavesurfer and regions exist before proceeding
    if (!wavesurfer || !regions) {
      return;
    }

    const updateRegion = () => {
      try {
        if (!wavesurfer || !regions) return;
        regions.clearRegions();
        regions.addRegion({
          start: currentLoopStart,
          end: currentLoopEnd,
          color: "rgba(59, 130, 246, 0.3)",
          drag: true,
          resize: true,
        });
      } catch (regionError) {
        console.warn("Failed to update region:", regionError);
      }
    };

    // Wait for audio to be ready
    try {
      if (wavesurfer.getDuration() === 0) {
        wavesurfer.once("ready", updateRegion);
      } else {
        updateRegion();
      }
    } catch (readyError) {
      console.warn("Failed to update region on ready:", readyError);
    }
  }, [loopStart, loopEnd]);

  if (!mainTrack) {
    return (
      <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
        Upload an audio file to see the waveform
      </div>
    );
  }

  return <div ref={waveformRef} className="w-full" />;
}
