import OpenAI, { APIError } from "openai";
import type { ChatMessage, ChatModel, ChatRequest } from "./chat-model.js";
import { LLMEmptyResponseError, LLMRateLimitError } from "./errors.js";

/**
 * Placeholder sent when no key is configured. Some OpenAI-compatible proxies
 * accept any bearer token; a real endpoint will reject it with a clear
 * authentication error instead of a silent misconfiguration.
 */
const FALLBACK_API_KEY = "missing-api-key";

export interface OpenAIChatModelOptions {
  readonly apiBase?: string;
  readonly apiKey?: string;
  readonly warn?: (message: string) => void;
}

function toOpenAIMessage(message: ChatMessage): OpenAI.Chat.Completions.ChatCompletionMessageParam {
  switch (message.role) {
    case "system":
      return { role: "system", content: message.content };
    case "user":
      return { role: "user", content: message.content };
    case "assistant":
      return { role: "assistant", content: message.content };
  }
}

function translateError(error: unknown): unknown {
  if (error instanceof APIError && (error.status === 429 || /rate.?limit/i.test(error.message))) {
    return new LLMRateLimitError(error.message, { cause: error });
  }
  return error;
}

/** OpenAI-compatible implementation of the `ChatModel` transport. */
export class OpenAIChatModel implements ChatModel {
  private readonly client: OpenAI;

  constructor(options: OpenAIChatModelOptions = {}) {
    const warn = options.warn ?? ((message: string) => console.warn(message));
    const apiKey =
      (options.apiKey !== undefined && options.apiKey !== "" ? options.apiKey : undefined) ??
      process.env.OPENAI_API_KEY;
    if (apiKey === undefined) {
      warn(
        "No API key configured (config `apiKey` or OPENAI_API_KEY); " +
          "requests may fail with an authentication error.",
      );
    }
    this.client = new OpenAI({
      apiKey: apiKey ?? FALLBACK_API_KEY,
      baseURL: options.apiBase,
    });
  }

  async complete(request: ChatRequest): Promise<string> {
    let completion: OpenAI.Chat.Completions.ChatCompletion;
    try {
      completion = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages.map(toOpenAIMessage),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      });
    } catch (error) {
      throw translateError(error);
    }

    const content = completion.choices[0]?.message.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new LLMEmptyResponseError("Chat completion returned no textual content");
    }
    return content;
  }
}
