import type { DialogueRecord } from "../models/dialogue.js";
import {
  DEFAULT_DIMENSION_WEIGHTS,
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  type DimensionEvaluation,
  type DimensionKey,
  type EvaluationResult,
  type EvaluationScore,
} from "../models/evaluation.js";

const RECOMMENDATION_THRESHOLD = 0.7;

export interface CreateResultParams {
  readonly taskId: string;
  readonly userProfileName: string;
  readonly evaluations: ReadonlyMap<DimensionKey, DimensionEvaluation>;
  readonly dialogueRecord: DialogueRecord;
}

/** Aggregates per-dimension evaluations into a weighted total score. */
export class Scorer {
  private readonly weights: Readonly<Record<DimensionKey, number>>;

  constructor(weights?: Readonly<Record<DimensionKey, number>>) {
    this.weights = weights ?? DEFAULT_DIMENSION_WEIGHTS;
  }

  /**
   * Converts the evaluation map into scores following the canonical
   * dimension order, so report ordering is deterministic regardless of
   * evaluation completion order.
   */
  aggregate(evaluations: ReadonlyMap<DimensionKey, DimensionEvaluation>): EvaluationScore[] {
    const scores: EvaluationScore[] = [];
    for (const key of DIMENSION_KEYS) {
      const evaluation = evaluations.get(key);
      if (evaluation === undefined) {
        continue;
      }
      scores.push({
        dimensionKey: key,
        label: DIMENSION_LABELS[key],
        rawScore: evaluation.score,
        weight: this.weights[key],
        evidence: evaluation.reasons,
      });
    }
    return scores;
  }

  /** Weighted total on a 0-100 scale. */
  calculateTotal(scores: readonly EvaluationScore[]): number {
    return scores.reduce((sum, score) => sum + score.rawScore * score.weight, 0) * 100;
  }

  createResult(params: CreateResultParams): EvaluationResult {
    const dimensionScores = this.aggregate(params.evaluations);
    const totalScore = this.calculateTotal(dimensionScores);
    const recommendations = dimensionScores
      .filter((score) => score.rawScore < RECOMMENDATION_THRESHOLD)
      .map((score) => `建议提升${score.label}表现`);

    return {
      taskId: params.taskId,
      userProfileName: params.userProfileName,
      totalScore,
      dimensionScores,
      dialogueRecord: params.dialogueRecord,
      recommendations,
    };
  }
}
