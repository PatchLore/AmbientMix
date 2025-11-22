"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Video, Download } from "lucide-react";
import { buildLoop } from "@/lib/video/buildLoop";

export default function VideoLabPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<10 | 30 | 60>(30);
  const [speed, setSpeed] = useState(0.8);
  const [crossfade, setCrossfade] = useState(0.8);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setVideoFile(null);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate video");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const file = new File([blob], `cogvideox-${Date.now()}.mp4`, { type: "video/mp4" });

      setVideoUrl(url);
      setVideoFile(file);
    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBuildLoop = async () => {
    if (!videoFile) {
      setError("Please generate a video first");
      return;
    }

    setIsRendering(true);
    setError(null);
    setProgress(0);

    try {
      const blob = await buildLoop({
        videoFile,
        duration: duration * 60, // Convert minutes to seconds
        speed,
        crossfade,
        onProgress: setProgress,
      });

      // Download the looped video
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ambient-video-${duration}min.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Render error:", error);
      setError(error instanceof Error ? error.message : "Failed to build loop");
    } finally {
      setIsRendering(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                AmbientVideoLab
              </Link>
              <span className="text-sm text-muted-foreground">(beta)</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/studio">
                <Button variant="ghost" size="sm">
                  Need matching ambience audio? → AmbientMix
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
          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1 - Generate Video</CardTitle>
              <CardDescription>
                Enter a prompt to generate an ambient video using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Dark academia rain study ambience, cozy fireplace, peaceful forest..."
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Video className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Video Preview */}
          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2 - Preview</CardTitle>
                <CardDescription>Your generated video</CardDescription>
              </CardHeader>
              <CardContent>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: "400px" }}
                />
              </CardContent>
            </Card>
          )}

          {/* Loop Builder */}
          {videoFile && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3 - Build Loop</CardTitle>
                <CardDescription>
                  Create a smooth, loopable video for your desired duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Loop Duration</Label>
                  <div className="flex gap-2">
                    {([10, 30, 60] as const).map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`
                          flex-1 px-4 py-2 text-sm rounded-md border transition-colors
                          ${
                            duration === dur
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-secondary border-input"
                          }
                        `}
                      >
                        {dur} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Speed</Label>
                    <span className="text-sm text-muted-foreground">{(speed * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Crossfade</Label>
                    <span className="text-sm text-muted-foreground">{crossfade.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={crossfade}
                    onChange={(e) => setCrossfade(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleBuildLoop}
                  disabled={isRendering}
                  className="w-full"
                >
                  {isRendering ? (
                    <>
                      <Video className="mr-2 h-4 w-4 animate-spin" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Render & Download
                    </>
                  )}
                </Button>

                {isRendering && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Rendering loop...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

