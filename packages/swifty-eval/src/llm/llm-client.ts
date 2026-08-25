import type { LLMSettings } from "../config.js";
import type { ChatMessage, ChatModel } from "./chat-model.js";
import { LLMRateLimitError } from "./errors.js";
import { OpenAIChatModel } from "./openai-chat-model.js";

export interface LLMClientOptions {
	readonly model: string;
	readonly apiBase?: string;
	readonly apiKey?: string;
	readonly temperature?: number;
	readonly maxTokens?: number;
	/** Injectable transport, mainly for tests. Defaults to `OpenAIChatModel`. */
	readonly chatModel?: ChatModel;
	/** Injectable delay function, mainly for tests. */
	readonly sleep?: (ms: number) => Promise<void>;
}

export interface ChatParams {
	readonly systemPrompt: string;
	readonly userMessage: string;
	readonly history?: readonly ChatMessage[];
	/** Per-call token cap; defaults to the client-level `maxTokens`. */
	readonly maxTokens?: number;
	readonly maxRetries?: number;
}

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 1000;

function defaultSleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * High-level chat client: assembles system/history/user messages and retries
 * rate-limited requests with exponential backoff. All other errors propagate
 * immediately.
 */
export class LLMClient {
	readonly model: string;
	readonly temperature: number;
	readonly maxTokens: number;
	private readonly chatModel: ChatModel;
	private readonly sleep: (ms: number) => Promise<void>;

	constructor(options: LLMClientOptions) {
		this.model = options.model;
		this.temperature = options.temperature ?? DEFAULT_TEMPERATURE;
		this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
		this.chatModel =
			options.chatModel ??
			new OpenAIChatModel({ apiBase: options.apiBase, apiKey: options.apiKey });
		this.sleep = options.sleep ?? defaultSleep;
	}

	static fromSettings(settings: LLMSettings, chatModel?: ChatModel): LLMClient {
		return new LLMClient({
			model: settings.model,
			apiBase: settings.apiBase,
			apiKey: settings.apiKey,
			temperature: settings.temperature,
			maxTokens: settings.maxTokens,
			chatModel,
		});
	}

	async chat(params: ChatParams): Promise<string> {
		const messages: ChatMessage[] = [
			{ role: "system", content: params.systemPrompt },
			...(params.history ?? []),
			{ role: "user", content: params.userMessage },
		];
		const maxRetries = params.maxRetries ?? DEFAULT_MAX_RETRIES;

		let lastError: unknown;
		for (let attempt = 0; attempt < maxRetries; attempt += 1) {
			try {
				return await this.chatModel.complete({
					model: this.model,
					messages,
					temperature: this.temperature,
					maxTokens: params.maxTokens ?? this.maxTokens,
				});
			} catch (error) {
				if (!(error instanceof LLMRateLimitError)) {
					throw error;
				}
				lastError = error;
				if (attempt < maxRetries - 1) {
					await this.sleep(2 ** attempt * BACKOFF_BASE_MS);
				}
			}
		}
		throw (
			lastError ?? new LLMRateLimitError("Rate-limited with no captured error")
		);
	}
}
