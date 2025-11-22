"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useSubscriptionStatus } from "@/app/hooks/useSubscriptionStatus";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AmbienceLayer } from "@/types/audio";
import { AMBIENCE_PACKS } from "@/app/data/packs";

interface AmbienceLayersCardProps {
  layers: AmbienceLayer[];
  onToggleLayer: (layerId: string) => void;
  onSetVolume: (layerId: string, volume: number) => void;
  onSetWarmth: (layerId: string, warmth: number) => void;
  onSetThunderFrequency?: (layerId: string, frequency: "low" | "medium" | "high") => void;
}

export function AmbienceLayersCard({
  layers,
  onToggleLayer,
  onSetVolume,
  onSetWarmth,
  onSetThunderFrequency,
}: AmbienceLayersCardProps) {
  const sub = useSubscriptionStatus();
  const isProActive = sub?.status === "active";

  // Map layers to packs to check Pro status
  const getPackForLayer = (layerType: string) => {
    return AMBIENCE_PACKS.find(pack => pack.type === layerType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2 - Add Ambience Layers</CardTitle>
        <CardDescription>
          Layer copyright-free ambience sounds on top of your track
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {layers.map((layer: AmbienceLayer) => {
          const pack = getPackForLayer(layer.type);
          const locked = pack?.isPro && !isProActive;

          return (
            <div
              key={layer.id}
              className="relative border rounded-lg p-4 space-y-4"
            >
              {/* Lock overlay for Pro-only packs */}
              {locked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="mb-3 text-sm text-muted-foreground text-center px-4">
                    Pro-only ambience pack
                  </p>
                  <Link href="/pricing">
                    <Button size="sm">Upgrade to unlock</Button>
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={layer.enabled}
                    onCheckedChange={() => !locked && onToggleLayer(layer.id)}
                    disabled={locked}
                  />
                  <Label className={`text-base font-medium ${locked ? "text-muted-foreground" : ""}`}>
                    {layer.name}
                  </Label>
                </div>
              </div>

              {layer.enabled && !locked && (
                <div className="space-y-4 pl-11">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Volume</Label>
                      <span className="text-sm text-muted-foreground">{layer.volume}%</span>
                    </div>
                    <Slider
                      value={[layer.volume]}
                      onValueChange={([value]) => onSetVolume(layer.id, value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Warmth</Label>
                      <span className="text-sm text-muted-foreground">{layer.warmth}%</span>
                    </div>
                    <Slider
                      value={[layer.warmth]}
                      onValueChange={([value]) => onSetWarmth(layer.id, value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  {layer.type === "distant-thunder" && onSetThunderFrequency && (
                    <div className="space-y-2">
                      <Label className="text-sm">Thunder Frequency</Label>
                      <div className="flex gap-2">
                        {(["low", "medium", "high"] as const).map((freq) => (
                          <button
                            key={freq}
                            onClick={() => onSetThunderFrequency(layer.id, freq)}
                            className={`
                              px-3 py-1.5 text-sm rounded-md border transition-colors
                              ${
                                layer.extraSettings?.thunderFrequency === freq
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background hover:bg-secondary border-input"
                              }
                            `}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

