import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runGemini({
  systemPrompt,
  userMessage,
  images = [],
  modelName = "gemini-1.5-flash", // ✅ stable working model
}: {
  systemPrompt?: string;
  userMessage?: string;
  images?: string[];
  modelName?: string;
}) {
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    const parts: any[] = [];

    // Add system prompt
    if (systemPrompt) {
      parts.push({ text: systemPrompt });
    }

    // Add user message
    if (userMessage) {
      parts.push({ text: userMessage });
    }

    // Add images (if provided)
    for (const imageUrl of images) {
      if (!imageUrl) continue;

      const base64 = await fetchImageAsBase64(imageUrl);

      parts.push({
        inlineData: {
          data: base64,
          mimeType: "image/png", // Change if needed
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