export type AmbiencePack = {
  id: string;
  name: string;
  description: string;
  isPro: boolean;
  type: "soft-rain" | "window-rain" | "distant-thunder" | "room-tone" | "storm-deep" | "forest-night" | "fireplace";
};

export const AMBIENCE_PACKS: AmbiencePack[] = [
  {
    id: "rain-basic",
    name: "Gentle Rain",
    description: "Soft rainfall with distant ambience.",
    isPro: false,
    type: "soft-rain",
  },
  {
    id: "storm-deep",
    name: "Deep Thunderstorm",
    description: "Heavy thunder, rolling clouds, cinematic feel.",
    isPro: true,
    type: "distant-thunder",
  },
  {
    id: "forest-night",
    name: "Night Forest",
    description: "Crickets, wind through trees, distant owls.",
    isPro: true,
    type: "room-tone",
  },
  {
    id: "fireplace",
    name: "Cozy Fireplace",
    description: "Crackling fire with soft room tone.",
    isPro: false,
    type: "room-tone",
  },
  {
    id: "window-rain",
    name: "Window Rain",
    description: "Rain hitting windows, cozy indoor feel.",
    isPro: false,
    type: "window-rain",
  },
];

