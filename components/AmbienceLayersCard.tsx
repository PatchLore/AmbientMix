"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { AmbienceLayer } from "@/types/audio";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2 - Add Ambience Layers</CardTitle>
        <CardDescription>
          Layer copyright-free ambience sounds on top of your track
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={layer.enabled}
                  onCheckedChange={() => onToggleLayer(layer.id)}
                />
                <Label className="text-base font-medium">{layer.name}</Label>
              </div>
            </div>

            {layer.enabled && (
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
        ))}
      </CardContent>
    </Card>
  );
}

