// app/api/ai/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents: prompt,
    });

    
    const result = response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "API failed to fetch" },
      { status: 500 }
    );
  }
}
