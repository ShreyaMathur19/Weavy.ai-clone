import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runGemini({
  systemPrompt,
  userMessage,
  images = [],
  modelName = "gemini-1.5-flash",
}: {
  systemPrompt?: string;
  userMessage?: string;
  images?: string[];
  modelName?: string;
}) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    const parts: any[] = [];

    if (systemPrompt) {
      parts.push({ text: systemPrompt });
    }

    if (userMessage) {
      parts.push({ text: userMessage });
    }

    for (const imageUrl of images) {
      if (!imageUrl) continue;

      const base64 = await fetchImageAsBase64(imageUrl);

      parts.push({
        inlineData: {
          data: base64,
          mimeType: "image/png",
        },
      });
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

async function fetchImageAsBase64(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }

  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}