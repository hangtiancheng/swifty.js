import { getMessages } from "../i18n/index.js";
import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue, modelTurns } from "./prompt-format.js";

/** Judges whether the model's replies read like a natural human conversation. */
export class NaturalnessEvaluator extends BaseEvaluator {
	readonly dimensionKey = "naturalness";

	protected async evaluateOnce(
		record: DialogueRecord,
		_task: TaskInstruction,
	): Promise<JudgeSample> {
		if (modelTurns(record).length === 0) {
			return { score: 1, reason: getMessages().noModelTurnsReason };
		}

		const prompt = `Evaluate the naturalness of the digital human's replies in the following dialogue.

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- Do the replies read like a real human conversation rather than mechanical templates
- Is the wording natural and fluent
- Is there unnatural repetition or boilerplate
- Are the sentences smooth and coherent

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of dialogue naturalness.",
			prompt,
		);
	}
}
