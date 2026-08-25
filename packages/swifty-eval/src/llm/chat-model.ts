export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
	readonly role: ChatRole;
	readonly content: string;
}

export interface ChatRequest {
	readonly model: string;
	readonly messages: readonly ChatMessage[];
	readonly temperature: number;
	readonly maxTokens: number;
}

/**
 * Minimal chat-completion transport. Implementations must map provider
 * failures to `LLMError` subclasses where a typed reaction is required
 * (rate limiting, empty responses).
 */
export interface ChatModel {
	complete(request: ChatRequest): Promise<string>;
}
