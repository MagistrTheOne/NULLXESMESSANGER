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

export async function* streamAnnaResponse(request: AnnaRequest): AsyncGenerator<string, void, unknown> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const systemPrompt = request.mode === "tech"
    ? "You are Anna, a technical AI assistant. Provide detailed, code-focused responses with technical depth."
    : "You are Anna, a friendly and helpful AI assistant. Provide clear, concise, and helpful responses.";

  const conversationHistory = request.messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: conversationHistory.slice(0, -1),
    generationConfig: {
      temperature: request.mode === "tech" ? 0.7 : 0.9,
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
}

export async function getAnnaResponse(request: AnnaRequest): Promise<string> {
  let fullResponse = "";
  for await (const chunk of streamAnnaResponse(request)) {
    fullResponse += chunk;
  }
  return fullResponse;
}

