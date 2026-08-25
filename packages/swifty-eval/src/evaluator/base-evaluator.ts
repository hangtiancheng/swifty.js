import { z } from "zod";
import type { LLMClient } from "../llm/llm-client.js";
import type { DialogueRecord } from "../models/dialogue.js";
import type { DimensionEvaluation, DimensionKey } from "../models/evaluation.js";
import type { TaskInstruction } from "../models/task.js";
import { describeError } from "../utils/errors.js";
import { extractJsonObject } from "../utils/json.js";

const judgeVerdictSchema = z.object({
  score: z.number(),
  reason: z.string().optional(),
});

/** One judge call outcome: score in [0, 1] plus the judge's rationale. */
export interface JudgeSample {
  readonly score: number;
  readonly reason: string;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Removes one highest- and one lowest-scoring sample (score and rationale
 * stay paired). Callers only invoke this with three or more samples.
 */
export function trimExtremes(samples: readonly JudgeSample[]): JudgeSample[] {
  const kept = [...samples];
  const maxIndex = kept.reduce(
    (best, sample, index, all) =>
      sample.score > (all[best]?.score ?? Number.NEGATIVE_INFINITY) ? index : best,
    0,
  );
  kept.splice(maxIndex, 1);
  const minIndex = kept.reduce(
    (best, sample, index, all) =>
      sample.score < (all[best]?.score ?? Number.POSITIVE_INFINITY) ? index : best,
    0,
  );
  kept.splice(minIndex, 1);
  return kept;
}

/**
 * Base class for dimension evaluators. Each dimension is judged `evalCount`
 * times; with three or more valid samples the extremes are trimmed before
 * averaging to reduce judge variance. Failed judge calls are excluded from
 * the average instead of silently counting as zero.
 */
export abstract class BaseEvaluator {
  abstract readonly dimensionKey: DimensionKey;
  protected readonly llmClient: LLMClient;
  readonly evalCount: number;

  constructor(llmClient: LLMClient, evalCount = 3) {
    if (!Number.isInteger(evalCount) || evalCount < 1) {
      throw new RangeError(`evalCount must be a positive integer, got ${evalCount}`);
    }
    this.llmClient = llmClient;
    this.evalCount = evalCount;
  }

  async evaluate(record: DialogueRecord, task: TaskInstruction): Promise<DimensionEvaluation> {
    const samples: JudgeSample[] = [];
    const failures: string[] = [];
    for (let i = 0; i < this.evalCount; i += 1) {
      try {
        samples.push(await this.evaluateOnce(record, task));
      } catch (error) {
        failures.push(describeError(error));
      }
    }

    if (samples.length === 0) {
      return {
        score: 0,
        reasons: [
          `评估失败：${this.evalCount} 次评估调用均未返回有效结果（${failures[0] ?? "未知错误"}）`,
        ],
      };
    }

    const kept = samples.length >= 3 ? trimExtremes(samples) : samples;
    const score = kept.reduce((sum, sample) => sum + sample.score, 0) / kept.length;
    const reasons = kept.map((sample) => sample.reason);
    if (failures.length > 0) {
      reasons.push(`注：${failures.length} 次评估调用失败，未计入平均`);
    }
    return { score, reasons };
  }

  protected abstract evaluateOnce(
    record: DialogueRecord,
    task: TaskInstruction,
  ): Promise<JudgeSample>;

  /**
   * Sends a judge prompt and parses the `{"score": ..., "reason": ...}`
   * response, tolerating Markdown code fences. Parse failures throw and are
   * counted as failed samples by `evaluate`.
   */
  protected async requestJudgeVerdict(
    systemPrompt: string,
    userMessage: string,
  ): Promise<JudgeSample> {
    const response = await this.llmClient.chat({ systemPrompt, userMessage });
    const verdict = judgeVerdictSchema.parse(extractJsonObject(response));
    return { score: clamp01(verdict.score), reason: verdict.reason ?? "" };
  }
}
