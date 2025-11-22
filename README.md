# AmbientMix

AmbientMix lets creators upload a music or ambience track, layer in copyright-free rain / thunder / room tones, tweak warmth and intensity, and export a perfectly looped mix for YouTube, sleep, study, or meditation videos – all in the browser.

## Features

### AmbientMix (Audio Mixer)
- **Upload main audio**: Accept MP3/WAV files (up to 50 MB, minimum 3 seconds)
- **File validation**: Client-side validation for file type, size, and duration
- **Waveform visualizer**: Interactive waveform display using wavesurfer.js
- **Loop selection**: Drag handles to select start and end points for looping
- **Built-in ambience library**: Preloaded, copyright-free loops (soft rain, window rain, distant thunder, room tone)
- **Layer controls**: Volume, warmth sliders per ambience layer
- **Loop duration**: Choose 10, 30, or 60 minutes
- **Preview**: Real-time preview of the first 30 seconds using Web Audio API
- **Export**: Render and download as MP3 using ffmpeg.wasm

### AmbientVideoLab (Video Generator)
- **AI video generation**: Generate ambient videos using CogVideoX via HuggingFace API
- **Video loop builder**: Create smooth, loopable videos with speed and crossfade controls
- **Duration selection**: Export videos in 10, 30, or 60 minute loops
- **Client-side rendering**: All processing happens in the browser using ffmpeg.wasm

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:
```bash
# Required for AmbientVideoLab (video generation)
HF_TOKEN=your_huggingface_token_here
```

   To get a HuggingFace token:
   - Sign up at [huggingface.co](https://huggingface.co)
   - Go to Settings → Access Tokens
   - Create a new token with read permissions

3. Add ambience audio files:
   Place your copyright-free ambience loops in `public/ambience/`:
   - `soft-rain.mp3`
   - `window-rain.mp3`
   - `distant-thunder.mp3`
   - `room-tone.mp3`

   **Note:** These files are not included in the repository. You'll need to source copyright-free ambience loops. Good sources include:
   - [Freesound.org](https://freesound.org) - Search for "rain", "thunder", "room tone" with CC0 license
   - [Zapsplat](https://www.zapsplat.com) - Free sound effects library
   - [BBC Sound Effects Library](https://sound-effects.bbcrewind.co.uk) - Free for personal use
   - Create your own loops (30-60 seconds, seamless loops work best)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

   - `/studio` - AmbientMix audio mixer
   - `/videolab` - AmbientVideoLab video generator

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── studio/
│   │   └── page.tsx        # AmbientMix audio mixer UI
│   ├── videolab/
│   │   └── page.tsx        # AmbientVideoLab video generator UI
│   └── api/
│       └── generate-video/
│           └── route.ts    # HuggingFace API proxy for video generation
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── UploadCard.tsx      # File upload with validation & waveform
│   ├── Waveform.tsx        # Audio waveform visualizer with loop selection
│   ├── AmbienceLayersCard.tsx  # Ambience controls
│   └── LoopAndExportCard.tsx   # Export controls
├── hooks/
│   └── useMixerState.ts    # Mixer state management
├── lib/
│   ├── audio/
│   │   ├── renderMix.ts    # Audio rendering with ffmpeg.wasm
│   │   └── preview.ts      # Preview functionality with Web Audio API
│   ├── video/
│   │   └── buildLoop.ts    # Video loop builder with ffmpeg.wasm
│   └── utils.ts            # Utility functions
└── types/
    └── audio.ts            # TypeScript types
```

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **wavesurfer.js** (waveform visualization and loop selection)
- **Web Audio API** (for audio preview)
- **ffmpeg.wasm** (client-side audio/video rendering)
- **HuggingFace Inference API** (AI video generation)

## Completed Features

- ✅ File upload with drag & drop
- ✅ Client-side file validation (type, size, duration)
- ✅ Audio waveform visualizer
- ✅ Loop region selection with draggable handles
- ✅ Audio mixing with ffmpeg.wasm
- ✅ Volume and warmth filters per layer
- ✅ Real-time audio preview
- ✅ AI video generation via HuggingFace API
- ✅ Video loop builder with speed and crossfade controls
- ✅ Cross-links between AmbientMix and AmbientVideoLab

## Roadmap

- [ ] User accounts and saved presets
- [ ] Higher quality exports (320kbps, WAV)
- [ ] More ambience types and variations
- [ ] Batch processing for multiple files
- [ ] Cloud storage integration
- [ ] Real-time collaboration

## License

MIT

