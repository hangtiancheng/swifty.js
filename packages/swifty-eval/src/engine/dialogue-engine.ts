import { getMessages, withOutputLanguageDirective } from "../i18n/index.js";
import type { ChatMessage } from "../llm/chat-model.js";
import type { LLMClient } from "../llm/llm-client.js";
import type { DialogueRecord, DialogueTurn, TerminationReason } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import type { UserSimulator } from "../simulator/user-simulator.js";
import { DialogueStateMachine } from "./state-machine.js";

const TERMINATION_KEYWORDS = [
  "再见",
  "挂断",
  "结束",
  "拜拜",
  "bye",
  "goodbye",
  "hang up",
  "see you",
] as const;
const HANGUP_SIGNAL = "[HANGUP]";
const DEFAULT_MAX_ROUNDS = 30;
const DEFAULT_MIN_ROUNDS = 4;

const REFUSAL_JUDGE_PROMPT =
  "Determine whether the user is clearly refusing to continue the conversation or asking to hang up the phone. Reply with only yes or no.";

/** Replaces `${name}` placeholders with the provided values; unknown names are kept. */
export function resolvePlaceholders(
  text: string,
  values: Readonly<Record<string, string>>,
): string {
  return text.replace(/\$\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/** Strips the hangup marker from a simulated reply and reports its presence. */
export function parseHangupSignal(message: string): { content: string; hangup: boolean } {
  if (message.includes(HANGUP_SIGNAL)) {
    return { content: message.replaceAll(HANGUP_SIGNAL, "").trim(), hangup: true };
  }
  return { content: message, hangup: false };
}

function containsTerminationKeyword(message: string): boolean {
  return TERMINATION_KEYWORDS.some((keyword) => message.includes(keyword));
}

export interface DialogueEngineOptions {
  readonly task: TaskInstruction;
  /**
   * Client used to detect refusals. Prefer the judge model so that detection
   * is independent from the model under test; defaults to the model client.
   */
  readonly refusalJudge?: LLMClient;
  /** Values for `${name}` placeholders in the opening line. */
  readonly placeholders?: Readonly<Record<string, string>>;
  /** Injectable RNG in [0, 1), used to pick sample placeholder values. */
  readonly random?: () => number;
  /** Injectable clock for deterministic timestamps. */
  readonly now?: () => Date;
}

export interface RunDialogueParams {
  readonly userSimulator: UserSimulator;
  readonly modelClient: LLMClient;
  readonly maxRounds?: number;
  /** Refusal/termination detection only activates after this many rounds. */
  readonly minRounds?: number;
}

/** Runs multi-round dialogues between the model under test and a user simulator. */
export class DialogueEngine {
  readonly stateMachine = new DialogueStateMachine();
  private readonly task: TaskInstruction;
  private readonly options: DialogueEngineOptions;

  constructor(options: DialogueEngineOptions) {
    this.task = options.task;
    this.options = options;
  }

  async runDialogue(params: RunDialogueParams): Promise<DialogueRecord> {
    const { userSimulator, modelClient } = params;
    const maxRounds = params.maxRounds ?? DEFAULT_MAX_ROUNDS;
    const minRounds = params.minRounds ?? DEFAULT_MIN_ROUNDS;
    const refusalJudge = this.options.refusalJudge ?? modelClient;
    const now = this.options.now ?? (() => new Date());

    const turns: DialogueTurn[] = [];
    const startTime = now().toISOString();
    let terminationReason: TerminationReason | undefined;

    this.stateMachine.reset();
    this.stateMachine.transition("identityCheck");

    let modelMessage = resolvePlaceholders(this.task.openingLine, this.placeholderValues());
    const taskContext = `You are receiving a call from ${this.task.role}. Background: ${this.task.task}`;

    for (let round = 1; round <= maxRounds; round += 1) {
      if (round > 1) {
        modelMessage = await this.generateModelResponse(modelClient, turns);
      }
      turns.push({ roundNumber: round, role: "model", content: modelMessage });

      const rawResponse = await userSimulator.generateResponse(
        modelMessage,
        round === 1 ? taskContext : undefined,
      );
      const { content: userResponse, hangup } = parseHangupSignal(rawResponse);
      turns.push({ roundNumber: round, role: "user", content: userResponse });

      if (round === 1) {
        this.stateMachine.transition("flowExecution");
      }

      if (hangup || (round > minRounds && (await this.judgeRefusal(refusalJudge, userResponse)))) {
        this.stateMachine.transition("userRefusal");
        this.stateMachine.transition("end");
        terminationReason = "userRefused";
        break;
      }
      if (round > minRounds && containsTerminationKeyword(userResponse)) {
        terminationReason = "userEndedConversation";
        break;
      }
    }

    return {
      taskId: this.task.taskId,
      userProfile: userSimulator.profile,
      turns,
      terminationReason: terminationReason ?? "maxRoundsReached",
      startTime,
      endTime: now().toISOString(),
    };
  }

  private placeholderValues(): Record<string, string> {
    const random = this.options.random ?? Math.random;
    const names = getMessages().sampleRiderNames;
    const index = Math.floor(random() * names.length);
    return {
      rider_name: names[index] ?? names[0] ?? "",
      ...this.options.placeholders,
    };
  }

  private async judgeRefusal(judge: LLMClient, userResponse: string): Promise<boolean> {
    try {
      const verdict = await judge.chat({
        systemPrompt: REFUSAL_JUDGE_PROMPT,
        userMessage: `The user says: ${userResponse}`,
      });
      return verdict.trim().toLowerCase().startsWith("yes");
    } catch {
      return false;
    }
  }

  private async generateModelResponse(
    modelClient: LLMClient,
    turns: readonly DialogueTurn[],
  ): Promise<string> {
    const flowDescription = this.task.flow
      .map((step) => `${step.stepId}. ${step.description}`)
      .join("\n");

    const faqDescription =
      this.task.faq.length > 0
        ? `\nKnowledge base:\n${this.task.faq.map((item) => `- ${item.question}: ${item.answer}`).join("\n")}`
        : "";

    const constraints: string[] = [];
    if (this.task.constraints.maxChars !== undefined) {
      constraints.push(`Keep each reply within ${this.task.constraints.maxChars} characters`);
    }
    if (this.task.constraints.tone !== undefined) {
      constraints.push(`Tone requirement: ${this.task.constraints.tone}`);
    }
    if (this.task.constraints.forbiddenPhrases.length > 0) {
      constraints.push(`Do not use: ${this.task.constraints.forbiddenPhrases.join(", ")}`);
    }
    constraints.push("Speak naturally, as if on a phone call");
    constraints.push("Avoid repeating replies; rephrase when restating");

    const systemPrompt = withOutputLanguageDirective(`You are ${this.task.role}.
Task: ${this.task.task}

Dialogue flow (complete in order):
${flowDescription}
${faqDescription}

Constraints:
${constraints.map((constraint) => `- ${constraint}`).join("\n")}`);

    // The last turn is the user's latest reply; everything before it is history.
    const latestTurn = turns.at(-1);
    const userMessage = latestTurn?.role === "user" ? latestTurn.content : "";
    const history: ChatMessage[] = turns.slice(0, -1).map((turn) => ({
      role: turn.role === "model" ? "assistant" : "user",
      content: turn.content,
    }));

    return modelClient.chat({
      systemPrompt,
      userMessage,
      history: history.length > 0 ? history : undefined,
    });
  }
}
