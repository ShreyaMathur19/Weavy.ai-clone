import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function runGemini(
  prompt: string,
  modelName: string = "gemini-1.5-flash"
) {
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}