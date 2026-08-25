import type { ChatMessage } from "../llm/chat-model.js";
import type { LLMClient } from "../llm/llm-client.js";
import type { DialogueRecord, DialogueTurn, TerminationReason } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import type { UserSimulator } from "../simulator/user-simulator.js";
import { DialogueStateMachine } from "./state-machine.js";

const SAMPLE_RIDER_NAMES = ["小王", "小李", "小张", "小刘", "师傅"] as const;
const TERMINATION_KEYWORDS = ["再见", "挂断", "结束", "拜拜"] as const;
const HANGUP_SIGNAL = "[HANGUP]";
const DEFAULT_MAX_ROUNDS = 30;
const DEFAULT_MIN_ROUNDS = 4;

const REFUSAL_JUDGE_PROMPT = "判断用户是否在明确拒绝继续对话或要求挂断电话。只回复yes或no。";

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
    const taskContext = `你正在接到${this.task.role}的电话。背景：${this.task.task}`;

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
    const index = Math.floor(random() * SAMPLE_RIDER_NAMES.length);
    return {
      rider_name: SAMPLE_RIDER_NAMES[index] ?? SAMPLE_RIDER_NAMES[0],
      ...this.options.placeholders,
    };
  }

  private async judgeRefusal(judge: LLMClient, userResponse: string): Promise<boolean> {
    try {
      const verdict = await judge.chat({
        systemPrompt: REFUSAL_JUDGE_PROMPT,
        userMessage: `用户说：${userResponse}`,
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
        ? `\n知识库：\n${this.task.faq.map((item) => `- ${item.question}：${item.answer}`).join("\n")}`
        : "";

    const constraints: string[] = [];
    if (this.task.constraints.maxChars !== undefined) {
      constraints.push(`每次回复控制在${this.task.constraints.maxChars}字以内`);
    }
    if (this.task.constraints.tone !== undefined) {
      constraints.push(`语气要求：${this.task.constraints.tone}`);
    }
    if (this.task.constraints.forbiddenPhrases.length > 0) {
      constraints.push(`禁止使用：${this.task.constraints.forbiddenPhrases.join("、")}`);
    }
    constraints.push("保持自然口语化，像打电话一样");
    constraints.push("避免重复回复；如需重申换种方式表达");

    const systemPrompt = `你是${this.task.role}。
任务：${this.task.task}

对话流程（请按顺序完成）：
${flowDescription}
${faqDescription}

约束：
${constraints.map((constraint) => `- ${constraint}`).join("\n")}`;

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
