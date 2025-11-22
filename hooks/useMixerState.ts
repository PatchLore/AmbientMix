"use client";

import { useState, useCallback } from "react";
import type { MixerState, MainTrack, AmbienceLayer, AmbienceType } from "@/types/audio";

const DEFAULT_AMBIENCE_LAYERS: Omit<AmbienceLayer, "id">[] = [
  {
    type: "soft-rain",
    name: "Soft Rain",
    enabled: false,
    volume: 50,
    warmth: 50,
  },
  {
    type: "window-rain",
    name: "Window Rain",
    enabled: false,
    volume: 50,
    warmth: 50,
  },
  {
    type: "distant-thunder",
    name: "Distant Thunder",
    enabled: false,
    volume: 50,
    warmth: 50,
    extraSettings: {
      thunderFrequency: "medium",
    },
  },
  {
    type: "room-tone",
    name: "Room Tone",
    enabled: false,
    volume: 50,
    warmth: 50,
  },
];

export function useMixerState() {
  const [state, setState] = useState<MixerState>({
    mainTrack: null,
    ambienceLayers: DEFAULT_AMBIENCE_LAYERS.map((layer, index) => ({
      ...layer,
      id: `layer-${index}`,
    })),
    loopDuration: 30,
  });

  const setMainTrack = useCallback((file: File, duration: number) => {
    setState((prev) => ({
      ...prev,
      mainTrack: {
        file,
        duration,
        name: file.name,
        size: file.size,
      },
    }));
  }, []);

  const toggleLayer = useCallback((layerId: string) => {
    setState((prev) => ({
      ...prev,
      ambienceLayers: prev.ambienceLayers.map((layer) =>
        layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
      ),
    }));
  }, []);

  const setLayerVolume = useCallback((layerId: string, volume: number) => {
    setState((prev) => ({
      ...prev,
      ambienceLayers: prev.ambienceLayers.map((layer) =>
        layer.id === layerId ? { ...layer, volume } : layer
      ),
    }));
  }, []);

  const setLayerWarmth = useCallback((layerId: string, warmth: number) => {
    setState((prev) => ({
      ...prev,
      ambienceLayers: prev.ambienceLayers.map((layer) =>
        layer.id === layerId ? { ...layer, warmth } : layer
      ),
    }));
  }, []);

  const setThunderFrequency = useCallback(
    (layerId: string, frequency: "low" | "medium" | "high") => {
      setState((prev) => ({
        ...prev,
        ambienceLayers: prev.ambienceLayers.map((layer) =>
          layer.id === layerId
            ? {
                ...layer,
                extraSettings: {
                  ...layer.extraSettings,
                  thunderFrequency: frequency,
                },
              }
            : layer
        ),
      }));
    },
    []
  );

  const setLoopDuration = useCallback((duration: 10 | 30 | 60) => {
    setState((prev) => ({
      ...prev,
      loopDuration: duration,
    }));
  }, []);

  const setLoopRegion = useCallback((start: number, end: number) => {
    setState((prev) => ({
      ...prev,
      loopStart: start,
      loopEnd: end,
    }));
  }, []);

  const loadState = useCallback((loadedState: MixerState) => {
    setState(loadedState);
  }, []);

  return {
    state,
    setMainTrack,
    toggleLayer,
    setLayerVolume,
    setLayerWarmth,
    setThunderFrequency,
    setLoopDuration,
    setLoopRegion,
    loadState,
  };
}

