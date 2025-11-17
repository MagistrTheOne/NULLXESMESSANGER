import { getSystemPrompt } from "@/lib/annaSystemPrompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

const API_KEY = Constants.expoConfig?.extra?.googleAiApiKey || process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AnnaMessage {
  role: "user" | "model";
  content: string;
}

export interface AnnaRequest {
  messages: AnnaMessage[];
  mode?: "normal" | "tech";
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* streamAnnaResponse(request: AnnaRequest): AsyncGenerator<string, void, unknown> {
  const mode = request.mode || "normal";
  const systemPrompt = getSystemPrompt(mode);
  
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const conversationHistory = [
        {
          role: "user" as const,
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model" as const,
          parts: [{ text: "Понял. Я Anna, готова помочь." }],
        },
        ...request.messages.slice(0, -1).map((msg) => ({
          role: msg.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: msg.content }],
        })),
      ];

      const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          temperature: mode === "tech" ? 0.7 : 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const lastMessage = request.messages[request.messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        return;
      }

      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }

      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;

      if (retries < MAX_RETRIES) {
        await delay(RETRY_DELAY * retries);
      } else {
        throw new Error(`Failed to get Anna response after ${MAX_RETRIES} retries: ${lastError.message}`);
      }
    }
  }
}

export async function getAnnaResponse(request: AnnaRequest): Promise<string> {
  let fullResponse = "";
  for await (const chunk of streamAnnaResponse(request)) {
    fullResponse += chunk;
  }
  return fullResponse;
}

