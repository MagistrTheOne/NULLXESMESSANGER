import { useState, useEffect, useCallback, useRef } from "react";
import { streamAnnaResponse, type AnnaMessage } from "@/lib/api/google-ai";

export interface UseStreamOptions {
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export function useStream(messages: AnnaMessage[], mode: "normal" | "tech" = "normal", options?: UseStreamOptions) {
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setStreamingText("");
    setError(null);

    try {
      const generator = streamAnnaResponse({ messages, mode });
      let fullText = "";
      
      for await (const chunk of generator) {
        fullText += chunk;
        setStreamingText(fullText);
      }

      options?.onComplete?.(fullText);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Streaming failed");
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, mode, isStreaming, options]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setStreamingText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    streamingText,
    isStreaming,
    error,
    startStream,
    stopStream,
    reset,
  };
}

