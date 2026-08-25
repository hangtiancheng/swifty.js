import type { DialogueRecord, DialogueTurn } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { modelTurns } from "./prompt-format.js";

const CHAR_LIMIT_WEIGHT = 0.4;
const FORBIDDEN_WEIGHT = 0.3;
const TONE_WEIGHT = 0.3;
const TONE_SAMPLE_SIZE = 3;

export interface RuleCheckResult {
  readonly score: number;
  readonly reason: string;
}

/** Rule check: share of model replies within the character limit. */
export function evaluateCharLimit(
  turns: readonly DialogueTurn[],
  maxChars: number | undefined,
): RuleCheckResult {
  if (maxChars === undefined) {
    return { score: 1, reason: "" };
  }
  const violations = turns.filter((turn) => turn.content.length > maxChars);
  const score = (turns.length - violations.length) / turns.length;
  const reason =
    violations.length > 0
      ? `${violations.length}/${turns.length}条超出${maxChars}字限制`
      : "全部符合字数限制";
  return { score, reason };
}

/** Rule check: penalizes each reply containing a forbidden phrase. */
export function evaluateForbiddenPhrases(
  turns: readonly DialogueTurn[],
  forbiddenPhrases: readonly string[],
): RuleCheckResult {
  if (forbiddenPhrases.length === 0) {
    return { score: 1, reason: "" };
  }
  let violations = 0;
  const foundPhrases: string[] = [];
  for (const turn of turns) {
    for (const phrase of forbiddenPhrases) {
      if (turn.content.includes(phrase)) {
        violations += 1;
        if (!foundPhrases.includes(phrase)) {
          foundPhrases.push(phrase);
        }
      }
    }
  }
  const score = Math.max(0, 1 - violations / turns.length);
  const reason =
    foundPhrases.length > 0 ? `使用了禁止词: ${foundPhrases.join(", ")}` : "未使用禁止词";
  return { score, reason };
}

/**
 * Combines rule checks (character limit, forbidden phrases) with an
 * LLM-judged tone check into a single weighted dimension score.
 */
export class ConstraintComplianceEvaluator extends BaseEvaluator {
  readonly dimensionKey = "constraintCompliance";

  protected async evaluateOnce(
    record: DialogueRecord,
    task: TaskInstruction,
  ): Promise<JudgeSample> {
    const turns = modelTurns(record);
    if (turns.length === 0) {
      return { score: 1, reason: "无模型回复，默认满分" };
    }

    const charResult = evaluateCharLimit(turns, task.constraints.maxChars);
    const forbiddenResult = evaluateForbiddenPhrases(turns, task.constraints.forbiddenPhrases);
    const toneResult = await this.evaluateTone(turns, task);

    const score =
      charResult.score * CHAR_LIMIT_WEIGHT +
      forbiddenResult.score * FORBIDDEN_WEIGHT +
      toneResult.score * TONE_WEIGHT;

    const reasons: string[] = [];
    if (charResult.reason !== "") {
      reasons.push(`字数约束: ${charResult.reason}`);
    }
    if (forbiddenResult.reason !== "") {
      reasons.push(`禁止词: ${forbiddenResult.reason}`);
    }
    if (toneResult.reason !== "") {
      reasons.push(`语气风格: ${toneResult.reason}`);
    }

    return { score, reason: reasons.join("; ") };
  }

  private async evaluateTone(
    turns: readonly DialogueTurn[],
    task: TaskInstruction,
  ): Promise<JudgeSample> {
    const messages = turns.slice(0, TONE_SAMPLE_SIZE).map((turn) => `- ${turn.content}`);
    const prompt = `请评估以下对话回复的语气风格是否符合要求。

要求的语气：${task.constraints.tone ?? "自然口语化"}

对话回复：
${messages.join("\n")}

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的对话质量评估专家。", prompt);
  }
}
