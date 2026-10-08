import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";

const HF_API_URL = "https://api-inference.huggingface.co/models/zai-org/CogVideoX-5b";
const MAX_PROMPT_LENGTH = 1000;

export async function POST(request: NextRequest) {
  try {
    // Require an authenticated user before triggering external inference.
    const supabase = await supabaseServer();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const prompt = (body as { prompt?: unknown })?.prompt;

    if (typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return NextResponse.json(
        { error: "Prompt must not be empty" },
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be at most ${MAX_PROMPT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Server-side secret only. Never expose this to client code and never
    // fall back to a NEXT_PUBLIC_* variable.
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json(
        { error: "Video generation is not configured. Please try again later." },
        { status: 500 }
      );
    }

    // Call HuggingFace Inference API
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: trimmedPrompt }),
    });

    if (!response.ok) {
      console.error("HuggingFace API error:", response.status);
      return NextResponse.json(
        { error: "Failed to generate video" },
        { status: 502 }
      );
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
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}

