import { NextRequest, NextResponse } from "next/server";

const HF_TOKEN = process.env.HF_TOKEN || process.env.NEXT_PUBLIC_HF_TOKEN;
const HF_API_URL = "https://api-inference.huggingface.co/models/zai-org/CogVideoX-5b";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!HF_TOKEN) {
      return NextResponse.json(
        { error: "HuggingFace token not configured. Please set HF_TOKEN environment variable." },
        { status: 500 }
      );
    }

    // Call HuggingFace Inference API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="cogvideox-${Date.now()}.mp4"`,
      },
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate video",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

