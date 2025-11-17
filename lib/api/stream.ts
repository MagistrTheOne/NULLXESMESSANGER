export interface StreamChunk {
  type: "text" | "done" | "error";
  data?: string;
  error?: string;
}

export class StreamReader {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder: TextDecoder;

  constructor(stream: ReadableStream<Uint8Array>) {
    this.reader = stream.getReader();
    this.decoder = new TextDecoder();
  }

  async *read(): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.reader) {
      yield { type: "error", error: "Stream reader not initialized" };
      return;
    }

    try {
      while (true) {
        const { done, value } = await this.reader.read();
        
        if (done) {
          yield { type: "done" };
          break;
        }

        const text = this.decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              yield { type: "done" };
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield { type: "text", data: parsed.content };
              }
            } catch {
              yield { type: "text", data };
            }
          }
        }
      }
    } catch (error) {
      yield {
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      this.reader.releaseLock();
    }
  }

  async cancel(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel();
      this.reader.releaseLock();
      this.reader = null;
    }
  }
}

