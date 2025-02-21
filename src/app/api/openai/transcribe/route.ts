import { NextResponse } from "next/server";
import OpenAI from "openai";

let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: Request) {
  try {
    // Check if OpenAI client is initialized
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const base64Audio = body.audio;

    // Convert base64 to File object
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

    const data = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}
