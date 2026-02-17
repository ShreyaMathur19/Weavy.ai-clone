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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY missing at runtime");
    return "AI service not configured.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: modelName });

  const parts: any[] = [];

  if (systemPrompt) parts.push({ text: systemPrompt });
  if (userMessage) parts.push({ text: userMessage });

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });

  return result.response.text();
}