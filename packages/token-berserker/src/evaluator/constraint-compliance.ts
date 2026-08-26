import { getMessages } from "../i18n/index.js";
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
	const m = getMessages();
	const reason =
		violations.length > 0
			? m.charLimitViolationReason(violations.length, turns.length, maxChars)
			: m.charLimitOkReason;
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
	const m = getMessages();
	const reason =
		foundPhrases.length > 0
			? m.forbiddenPhrasesUsedReason(foundPhrases.join(", "))
			: m.forbiddenPhrasesOkReason;
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
			return { score: 1, reason: getMessages().noModelTurnsReason };
		}

		const charResult = evaluateCharLimit(turns, task.constraints.maxChars);
		const forbiddenResult = evaluateForbiddenPhrases(
			turns,
			task.constraints.forbiddenPhrases,
		);
		const toneResult = await this.evaluateTone(turns, task);

		const score =
			charResult.score * CHAR_LIMIT_WEIGHT +
			forbiddenResult.score * FORBIDDEN_WEIGHT +
			toneResult.score * TONE_WEIGHT;

		const m = getMessages();
		const reasons: string[] = [];
		if (charResult.reason !== "") {
			reasons.push(`${m.charLimitReasonLabel}: ${charResult.reason}`);
		}
		if (forbiddenResult.reason !== "") {
			reasons.push(
				`${m.forbiddenPhrasesReasonLabel}: ${forbiddenResult.reason}`,
			);
		}
		if (toneResult.reason !== "") {
			reasons.push(`${m.toneReasonLabel}: ${toneResult.reason}`);
		}

		return { score, reason: reasons.join("; ") };
	}

	private async evaluateTone(
		turns: readonly DialogueTurn[],
		task: TaskInstruction,
	): Promise<JudgeSample> {
		const replies = turns
			.slice(0, TONE_SAMPLE_SIZE)
			.map((turn) => `- ${turn.content}`);
		const prompt = `Evaluate whether the tone of the following dialogue replies meets the requirements.

Required tone: ${task.constraints.tone ?? "natural and conversational"}

Dialogue replies:
${replies.join("\n")}

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of dialogue quality.",
			prompt,
		);
	}
}
