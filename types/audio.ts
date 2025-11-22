export type AmbienceType = "soft-rain" | "window-rain" | "distant-thunder" | "room-tone";

export interface AmbienceLayer {
  id: string;
  type: AmbienceType;
  name: string;
  enabled: boolean;
  volume: number; // 0-100
  warmth: number; // 0-100
  extraSettings?: {
    thunderFrequency?: "low" | "medium" | "high";
  };
}

export interface MainTrack {
  file: File;
  duration: number; // in seconds
  name: string;
  size: number; // in bytes
}

export interface MixerState {
  mainTrack: MainTrack | null;
  ambienceLayers: AmbienceLayer[];
  loopDuration: 10 | 30 | 60; // in minutes
  loopStart?: number; // in seconds
  loopEnd?: number; // in seconds
}

export interface RenderOptions {
  duration: number; // in seconds
  mainTrack: MainTrack;
  ambienceLayers: AmbienceLayer[];
}

