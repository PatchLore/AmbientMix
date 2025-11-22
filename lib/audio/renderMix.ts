"use client";

export interface RenderMixLayer {
  id: string;
  type?: string; // layer type for identification (e.g., "distant-thunder")
  buffer?: AudioBuffer; // optional pre-decoded buffer
  file?: File | Blob; // or raw file/blob to decode
  enabled: boolean;
  volume: number; // 0–1
  lowpassHz?: number; // optional low-pass filter frequency
}

export interface RenderMixOptions {
  mainTrack: File; // the uploaded MP3/WAV
  ambienceLayers: RenderMixLayer[];
  durationSeconds: number; // 300, 600, 1800, etc.
  onProgress?: (percent: number) => void;
}

/**
 * Renders a mixed audio file from the main track and ambience layers.
 * Uses Web Audio API + MediaRecorder for client-side rendering.
 */
export async function renderMix(options: RenderMixOptions): Promise<Blob> {
  // Client-only guard
  if (typeof window === "undefined") {
    throw new Error("renderMix must be called in the browser (client-side only).");
  }

  // Check MediaRecorder support
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  const { mainTrack, ambienceLayers, durationSeconds, onProgress } = options;

  // Validate inputs
  if (!mainTrack) {
    throw new Error("Main track is required");
  }

  console.log("renderMix called with ambienceLayers:", ambienceLayers);
  
  // Find thunder layer - we need to check by matching with the enabled layers array order
  // For now, we'll identify it during decoding when we have access to the original layer type

  const enabledLayers = ambienceLayers.filter((layer) => layer.enabled);
  if (enabledLayers.length === 0) {
    throw new Error("At least one ambience layer must be enabled");
  }

  console.log("Enabled layers count:", enabledLayers.length);

  onProgress?.(5);

  try {
    // Create AudioContext
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (required by some browsers)
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    onProgress?.(10);

    // Decode the mainTrack file
    console.log("Decoding main track:", mainTrack.name);
    const mainTrackArrayBuffer = await mainTrack.arrayBuffer();
    const mainTrackBuffer = await audioContext.decodeAudioData(mainTrackArrayBuffer.slice(0));
    console.log("Main track decoded:", mainTrackBuffer.duration, "seconds");

    onProgress?.(20);

    // Decode ambience layers
    const decodedAmbienceLayers: Array<{
      buffer: AudioBuffer;
      volume: number;
      lowpassHz?: number;
    }> = [];

    for (let i = 0; i < enabledLayers.length; i++) {
      const layer = enabledLayers[i];
      if (!layer) continue;
      
      const layerType = layer.type || "";
      const layerId = layer.id || "";
      const isThunder = layerType === "distant-thunder" || layerType.includes("thunder") || layerId.includes("thunder") || layerId.includes("distant");
      
      if (isThunder) {
        console.log(`Decoding thunder layer ${i + 1}/${enabledLayers.length}: ${layer.id}`);
        console.log("Decoding thunder...", layer.file || layer.buffer);
      } else {
        console.log(`Decoding ambience layer ${i + 1}/${enabledLayers.length}: ${layer.id}`);
      }

      let buffer: AudioBuffer;

      if (layer.buffer) {
        // Use pre-decoded buffer
        buffer = layer.buffer;
        if (isThunder) {
          console.log("Thunder: Using pre-decoded buffer");
        }
      } else if (layer.file) {
        // Decode from file/blob
        if (isThunder) {
          console.log("Thunder file:", layer.file);
          console.log("Thunder file size:", layer.file.size, "bytes");
        }
        const arrayBuffer = await layer.file.arrayBuffer();
        buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      } else {
        throw new Error(`Ambience layer ${layer.id} has no buffer or file`);
      }

      if (isThunder) {
        console.log("Thunder decoded", buffer);
        console.log("Thunder buffer duration:", buffer.duration, "seconds");
        console.log("Thunder buffer sampleRate:", buffer.sampleRate);
        console.log("Thunder buffer numberOfChannels:", buffer.numberOfChannels);
        console.log("Thunder buffer length:", buffer.length, "samples");
        
        if (!buffer || buffer.length === 0) {
          console.error("Thunder buffer missing or zero length");
          throw new Error("Thunder buffer is invalid");
        }
      }

      decodedAmbienceLayers.push({
        buffer,
        volume: layer.volume,
        lowpassHz: layer.lowpassHz,
      });

      if (isThunder) {
        console.log(`✓ Thunder decoded: ${buffer.duration} seconds, volume: ${layer.volume}, lowpassHz: ${layer.lowpassHz}`);
      } else {
        console.log(`✓ Decoded ambience layer ${layer.id}:`, buffer.duration, "seconds");
      }
    }

    onProgress?.(30);

    // Create MediaStreamDestination for recording
    const destination = audioContext.createMediaStreamDestination();
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(destination);

    // Create sources and connect them
    const sources: AudioBufferSourceNode[] = [];

    // Main track source
    const mainSource = audioContext.createBufferSource();
    mainSource.buffer = mainTrackBuffer;
    mainSource.loop = true;

    const mainGain = audioContext.createGain();
    mainGain.gain.value = 1.0;

    mainSource.connect(mainGain);
    mainGain.connect(masterGain);
    sources.push(mainSource);

    // Ambience layer sources
    console.log("Creating ambience layer sources, count:", decodedAmbienceLayers.length);
    for (let i = 0; i < decodedAmbienceLayers.length; i++) {
      const layer = decodedAmbienceLayers[i];
      if (!layer || !layer.buffer) continue;
      
      const originalLayer = enabledLayers[i];
      if (!originalLayer) continue;
      
      const layerType = originalLayer.type || "";
      const layerId = originalLayer.id || "";
      const isThunder = layerType === "distant-thunder" || layerType.includes("thunder") || layerId.includes("thunder") || layerId.includes("distant");
      
      const source = audioContext.createBufferSource();
      source.buffer = layer.buffer;
      source.loop = true;

      const gain = audioContext.createGain();
      gain.gain.value = layer.volume;
      
      if (isThunder) {
        console.log("=== THUNDER AUDIO NODE CONFIG ===");
        console.log("Thunder gain value:", gain.gain.value);
        console.log("Thunder volume (0-1):", layer.volume);
        console.log("Thunder lowpass Hz:", layer.lowpassHz);
        console.log("Thunder buffer sampleRate:", layer.buffer.sampleRate);
        console.log("Thunder buffer duration:", layer.buffer.duration, "seconds");
        console.log("Thunder buffer channels:", layer.buffer.numberOfChannels);
        console.log("=== END THUNDER CONFIG ===");
      }

      // Apply low-pass filter if specified
      if (layer.lowpassHz) {
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = layer.lowpassHz;
        filter.Q.value = 1;
        
        if (isThunder) {
          console.log("Thunder: Applying lowpass filter at", layer.lowpassHz, "Hz");
        }

        source.connect(filter);
        filter.connect(gain);
      } else {
        if (isThunder) {
          console.log("Thunder: No filter applied");
        }
        source.connect(gain);
      }

      gain.connect(masterGain);
      sources.push(source);
      
      if (isThunder) {
        console.log("Thunder source created and connected to masterGain");
        console.log("Thunder audio graph: source ->", layer.lowpassHz ? "filter ->" : "", "gain -> masterGain -> destination");
      }
    }
    
    console.log("Audio graph summary:");
    console.log("- Main track: source -> gain(1.0) -> masterGain -> destination");
    console.log("- Ambience layers:", decodedAmbienceLayers.length);
    decodedAmbienceLayers.forEach((layer, i) => {
      const origLayer = enabledLayers[i];
      if (!origLayer) {
        console.log(`  - Layer ${i + 1}: (missing original layer)`);
        return;
      }
      
      const layerType = origLayer.type || "unknown";
      const isThunder = layerType === "distant-thunder" || layerType.includes("thunder");
      console.log(`  - Layer ${i + 1} (${layerType}): source ->`, layer.lowpassHz ? `filter(${layer.lowpassHz}Hz) ->` : "", `gain(${layer.volume}) -> masterGain`);
      if (isThunder) {
        console.log(`    THUNDER: volume=${layer.volume}, lowpassHz=${layer.lowpassHz || "none"}`);
      }
    });

    onProgress?.(40);

    // Set up MediaRecorder
    const chunks: BlobPart[] = [];
    let mimeType = "audio/webm;codecs=opus";
    
    // Try to find a supported mime type
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          throw new Error("No supported audio codec found for MediaRecorder");
        }
      }
    }

    const recorder = new MediaRecorder(destination.stream, { mimeType });

    // Set up recording promise
    const recordingPromise = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          console.log("Recording complete, blob size:", blob.size, "bytes");
          resolve(blob);
        } catch (err) {
          reject(err);
        }
      };

      recorder.onerror = (e) => {
        reject(e.error || new Error("MediaRecorder error"));
      };
    });

    onProgress?.(50);

    // Start playback and recording
    const startTime = audioContext.currentTime;
    
    // Start all sources
    // Note: sources[0] is main track, sources[1+] are ambience layers
    console.log("Starting", sources.length, "sources (1 main +", sources.length - 1, "ambience)");
    
    sources.forEach((source, index) => {
      // Index 0 is main track, index 1+ are ambience layers
      if (index === 0) {
        console.log("Starting main track source");
        try {
          source.start(startTime);
        } catch (err) {
          console.error("Main track start error", err);
          throw err;
        }
        return;
      }
      
      // Ambience layers start from index 1
      const ambienceIndex = index - 1;
      const originalLayer = enabledLayers[ambienceIndex];
      if (!originalLayer) {
        console.error(`Original layer not found at index ${ambienceIndex}`);
        return;
      }
      
      const layerType = originalLayer.type || "";
      const layerId = originalLayer.id || "";
      const isThunder = layerType === "distant-thunder" || layerType.includes("thunder") || layerId.includes("thunder") || layerId.includes("distant");
      
      if (isThunder) {
        console.log("Starting thunder source (ambience index:", ambienceIndex, ")");
      }
      
      try {
        source.start(startTime);
        if (isThunder) {
          console.log("✓ Thunder source started successfully");
        }
      } catch (err) {
        if (isThunder) {
          console.error("Thunder start error", err);
        } else {
          console.error(`Error starting ambience source ${ambienceIndex}:`, err);
        }
        throw err;
      }
    });

    // Start recording
    recorder.start(100); // Collect data every 100ms

    console.log("Started playback and recording for", durationSeconds, "seconds");

    // Progress tracking
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    if (onProgress) {
      const startedAt = performance.now();
      progressInterval = setInterval(() => {
        const elapsed = (performance.now() - startedAt) / 1000;
        const pct = Math.min(99, (elapsed / durationSeconds) * 100);
        onProgress(pct);
      }, 500);
    }

    // Stop after duration
    const durationMs = durationSeconds * 1000;
    const stopTimeout = setTimeout(() => {
      try {
        recorder.stop();
        sources.forEach((src) => {
          try {
            src.stop();
          } catch {
            // Ignore errors when stopping
          }
        });

        if (progressInterval) {
          clearInterval(progressInterval);
        }

        onProgress?.(100);
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }, durationMs);

    // Wait for recording to complete
    const blob = await recordingPromise;

    // Cleanup
    clearTimeout(stopTimeout);
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Close audio context
    try {
      await audioContext.close();
    } catch {
      // Ignore errors when closing
    }

    console.log("✓ Render complete");

    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ambient-mix.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error("Render error:", error);
    
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }
    
    throw new Error(`Failed to render mix: ${errorMessage}`);
  }
}
