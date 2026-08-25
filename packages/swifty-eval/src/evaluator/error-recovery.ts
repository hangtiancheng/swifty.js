import { getMessages } from "../i18n/index.js";
import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue, formatFlow } from "./prompt-format.js";

/** Judges whether the model steers deviating users back to the flow. */
export class ErrorRecoveryEvaluator extends BaseEvaluator {
	readonly dimensionKey = "errorRecovery";

	protected async evaluateOnce(
		record: DialogueRecord,
		task: TaskInstruction,
	): Promise<JudgeSample> {
		if (task.flow.length === 0) {
			return { score: 1, reason: getMessages().noFlowReason };
		}

		const prompt = `Evaluate the digital human's error recovery ability in the dialogue.

Required flow:
${formatFlow(task)}

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- Can the digital human detect when the user deviates from the flow
- Can it effectively guide the user back to the correct flow
- Is the guidance natural rather than rigid
- If the user never deviated from the flow, give a full score

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of dialogue error recovery.",
			prompt,
		);
	}
}
