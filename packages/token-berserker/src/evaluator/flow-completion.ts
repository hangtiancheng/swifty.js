import { getMessages } from "../i18n/index.js";
import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue, formatFlowWithRequired } from "./prompt-format.js";

/** Judges whether the required flow steps were completed in order. */
export class FlowCompletionEvaluator extends BaseEvaluator {
	readonly dimensionKey = "flowCompletion";

	protected async evaluateOnce(
		record: DialogueRecord,
		task: TaskInstruction,
	): Promise<JudgeSample> {
		if (task.flow.length === 0) {
			return { score: 1, reason: getMessages().noFlowReason };
		}

		const prompt = `Evaluate whether the following dialogue completed the required flow steps.

Required flow:
${formatFlowWithRequired(task)}

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- Were all required steps completed
- Were the steps executed in the correct order
- How well was each step executed

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of dialogue flow completion.",
			prompt,
		);
	}
}
