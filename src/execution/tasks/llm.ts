import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runLLMTask = task({
  id: "run-llm",
  run: async (payload: {
    model: string;
    systemPrompt?: string;
    userMessage: string;
    images?: string[];
  }) => {
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: payload.model,
    });

    const parts: any[] = [];

    if (payload.systemPrompt) {
      parts.push({ text: payload.systemPrompt });
    }

    parts.push({ text: payload.userMessage });

    if (payload.images?.length) {
      payload.images.forEach((url) => {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: url,
          },
        });
      });
    }

    const result = await model.generateContent(parts);
    const response = result.response.text();

    return { output: response };
  },
});