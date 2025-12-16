"use client";

import { useEffect, useState } from "react";
import { getAvailableSoundFX, type SoundFX } from "@/app/lib/soundfxLoader";

/**
 * Hook to automatically load and manage sound FX files
 */
export function useSoundFX() {
  const [fx, setFx] = useState<SoundFX[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFX() {
      try {
        setLoading(true);
        const availableFX = await getAvailableSoundFX();
        setFx(availableFX);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load sound FX");
        console.error("Error loading sound FX:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFX();
  }, []);

  return { fx, loading, error };
}

