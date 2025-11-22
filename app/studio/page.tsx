"use client";

import Link from "next/link";
import { useMixerState } from "@/hooks/useMixerState";
import { UploadCard } from "@/components/UploadCard";
import { AmbienceLayersCard } from "@/components/AmbienceLayersCard";
import { LoopAndExportCard } from "@/components/LoopAndExportCard";
import { Button } from "@/components/ui/button";

export default function StudioPage() {
  const {
    state,
    setMainTrack,
    toggleLayer,
    setLayerVolume,
    setLayerWarmth,
    setThunderFrequency,
    setLoopDuration,
    setLoopRegion,
  } = useMixerState();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                AmbientMix
              </Link>
              <span className="text-sm text-muted-foreground">(beta)</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/videolab">
                <Button variant="ghost" size="sm">
                  Generate ambient visuals → AmbientVideoLab
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  How it works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <UploadCard
            onFileSelected={setMainTrack}
            mainTrack={state.mainTrack}
            loopStart={state.loopStart}
            loopEnd={state.loopEnd}
            onRegionUpdate={setLoopRegion}
          />

          <AmbienceLayersCard
            layers={state.ambienceLayers}
            onToggleLayer={toggleLayer}
            onSetVolume={setLayerVolume}
            onSetWarmth={setLayerWarmth}
            onSetThunderFrequency={setThunderFrequency}
          />

          <LoopAndExportCard
            state={state}
            onDurationChange={setLoopDuration}
          />
        </div>
      </div>
    </div>
  );
}

