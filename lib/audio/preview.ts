"use client";

import type { MixerState } from "@/types/audio";

/**
 * Previews the first 30 seconds of the mix using Web Audio API.
 * 
 * This function will:
 * 1. Create an AudioContext
 * 2. Decode the main track and enabled ambience layers
 * 3. Apply volume and EQ adjustments
 * 4. Play the first 30 seconds
 */
export async function previewMix(state: MixerState): Promise<void> {
  // Prevent server-side execution
  if (typeof window === "undefined") {
    throw new Error("previewMix called on server – must be client only");
  }

  if (!state.mainTrack) {
    throw new Error("Main track is required");
  }

  const previewDuration = 30; // seconds

  // Create AudioContext
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    // Decode main track
    const mainTrackBuffer = await state.mainTrack.file.arrayBuffer();
    const mainTrackAudioBuffer = await audioContext.decodeAudioData(mainTrackBuffer);

    // Create gain node for main track
    const mainGainNode = audioContext.createGain();
    mainGainNode.gain.value = 1.0; // Main track at full volume
    mainGainNode.connect(audioContext.destination);

    // Create buffer source for main track
    const mainSource = audioContext.createBufferSource();
    mainSource.buffer = mainTrackAudioBuffer;
    mainSource.connect(mainGainNode);

    // Decode and mix ambience layers
    const enabledLayers = state.ambienceLayers.filter((layer) => layer.enabled);
    
    for (const layer of enabledLayers) {
      try {
        // Load ambience file from public/ambience/{layer.type}.mp3
        const ambienceUrl = `/ambience/${layer.type}.mp3`;
        const response = await fetch(ambienceUrl);
        
        if (!response.ok) {
          console.warn(`Ambience file not found: ${ambienceUrl}. Skipping layer.`);
          continue;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const ambienceBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create gain node for this layer
        const layerGain = audioContext.createGain();
        layerGain.gain.value = layer.volume / 100;
        layerGain.connect(audioContext.destination);
        
        // Apply warmth EQ (simplified - would use BiquadFilterNode in real implementation)
        // Map warmth (0-100) to lowpass frequency (500-3000 Hz)
        const lowPass = audioContext.createBiquadFilter();
        lowPass.type = "lowpass";
        lowPass.frequency.value = 500 + (layer.warmth * 25); // 500-3000 Hz range
        lowPass.Q.value = 1;
        
        // Create buffer source
        const layerSource = audioContext.createBufferSource();
        layerSource.buffer = ambienceBuffer;
        layerSource.loop = true; // Loop the ambience
        layerSource.connect(lowPass);
        lowPass.connect(layerGain);
        layerSource.start(0);
        
        // Stop after preview duration
        setTimeout(() => {
          layerSource.stop();
        }, previewDuration * 1000);
      } catch (error) {
        console.warn(`Failed to load ambience layer ${layer.type}:`, error);
      }
    }

    // Start playback
    mainSource.start(0);

    // Stop after preview duration
    setTimeout(() => {
      mainSource.stop();
      audioContext.close();
    }, previewDuration * 1000);

  } catch (error) {
    audioContext.close();
    throw error;
  }
}

