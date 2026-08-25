import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue } from "./prompt-format.js";

/** Judges how accurately the model understood user intent each round. */
export class IntentUnderstandingEvaluator extends BaseEvaluator {
	readonly dimensionKey = "intentUnderstanding";

	protected async evaluateOnce(
		record: DialogueRecord,
		_task: TaskInstruction,
	): Promise<JudgeSample> {
		const prompt = `Evaluate how accurately the digital human understood the user's intent in the dialogue.

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- Was the user's expressed intent correctly understood in every round
- Were the replies targeted at the user's actual needs
- Were there any answers that missed the question
- Could ambiguous expressions be reasonably interpreted

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of dialogue intent understanding.",
			prompt,
		);
	}
}
