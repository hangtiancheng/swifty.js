import type { DialogueRecord } from "./dialogue.js";

/** Canonical dimension order; also controls report ordering. */
export const DIMENSION_KEYS = [
	"flowCompletion",
	"constraintCompliance",
	"faqAccuracy",
	"naturalness",
	"intentUnderstanding",
	"errorRecovery",
	"coherence",
	"infoCompleteness",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const DEFAULT_DIMENSION_WEIGHTS: Readonly<Record<DimensionKey, number>> =
	{
		flowCompletion: 0.3,
		constraintCompliance: 0.2,
		faqAccuracy: 0.15,
		naturalness: 0.07,
		intentUnderstanding: 0.07,
		errorRecovery: 0.07,
		coherence: 0.07,
		infoCompleteness: 0.07,
	};

/** Aggregated outcome of one dimension: mean score in [0, 1] plus judge rationales. */
export interface DimensionEvaluation {
	readonly score: number;
	readonly reasons: readonly string[];
}

export interface EvaluationScore {
	readonly dimensionKey: DimensionKey;
	readonly label: string;
	/** Score in [0, 1] before weighting. */
	readonly rawScore: number;
	readonly weight: number;
	readonly evidence: readonly string[];
}

export interface EvaluationResult {
	readonly taskId: string;
	readonly userProfileName: string;
	/** Weighted total in [0, 100]. */
	readonly totalScore: number;
	readonly dimensionScores: readonly EvaluationScore[];
	readonly dialogueRecord: DialogueRecord;
	readonly recommendations: readonly string[];
}
