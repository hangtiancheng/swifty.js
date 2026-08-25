import type { ChatMessage } from "../llm/chat-model.js";
import type { LLMClient } from "../llm/llm-client.js";
import type { UserProfile } from "../models/dialogue.js";

const DEFAULT_MAX_HISTORY_ROUNDS = 10;

/**
 * Builds the effective simulator system prompt: the persona prompt plus a
 * numeric behavioral-tendency hint so the profile's probability fields
 * actually influence the simulated behavior.
 */
export function buildSimulatorSystemPrompt(profile: UserProfile): string {
  const refusalPercent = Math.round(profile.refusalProbability * 100);
  const questionPercent = Math.round(profile.questionProbability * 100);
  return `${profile.systemPrompt}
行为倾向参考：你大约有 ${refusalPercent}% 的倾向拒绝或推脱请求，${questionPercent}% 的倾向主动追问细节，请让整体表现大致符合这一倾向。`;
}

export interface UserSimulatorOptions {
  readonly profile: UserProfile;
  readonly llmClient: LLMClient;
  /** Number of dialogue rounds (model + user pairs) kept as context. */
  readonly maxHistoryRounds?: number;
}

/** Simulates user replies for a persona via LLM. */
export class UserSimulator {
  readonly profile: UserProfile;
  private readonly llmClient: LLMClient;
  private readonly maxHistoryRounds: number;
  private readonly systemPrompt: string;
  private history: ChatMessage[] = [];

  constructor(options: UserSimulatorOptions) {
    this.profile = options.profile;
    this.llmClient = options.llmClient;
    this.maxHistoryRounds = options.maxHistoryRounds ?? DEFAULT_MAX_HISTORY_ROUNDS;
    this.systemPrompt = buildSimulatorSystemPrompt(options.profile);
  }

  /** Generates the simulated user's reply to the model's message. */
  async generateResponse(modelMessage: string, additionalContext?: string): Promise<string> {
    const userMessage =
      additionalContext === undefined
        ? modelMessage
        : `[上下文: ${additionalContext}]\n\n${modelMessage}`;

    const response = await this.llmClient.chat({
      systemPrompt: this.systemPrompt,
      userMessage,
      history: this.history.length > 0 ? [...this.history] : undefined,
    });

    this.appendToHistory("assistant", modelMessage);
    this.appendToHistory("user", response);
    return response;
  }

  resetHistory(): void {
    this.history = [];
  }

  private appendToHistory(role: "assistant" | "user", content: string): void {
    this.history.push({ role, content });
    const maxMessages = this.maxHistoryRounds * 2;
    if (this.history.length > maxMessages) {
      this.history = this.history.slice(-maxMessages);
    }
  }
}
