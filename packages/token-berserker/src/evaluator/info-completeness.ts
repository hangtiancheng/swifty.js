import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue, formatFaq, formatFlow } from "./prompt-format.js";

/** Judges whether every key piece of information was conveyed. */
export class InfoCompletenessEvaluator extends BaseEvaluator {
	readonly dimensionKey = "infoCompleteness";

	protected async evaluateOnce(
		record: DialogueRecord,
		task: TaskInstruction,
	): Promise<JudgeSample> {
		const flowDescription = task.flow.length > 0 ? formatFlow(task) : "None";
		const faqDescription = task.faq.length > 0 ? formatFaq(task) : "None";

		const prompt = `Evaluate whether the digital human fully conveyed all key information in the dialogue.

Task flow:
${flowDescription}

FAQ knowledge:
${faqDescription}

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- Was every key piece of information that should be conveyed actually conveyed
- Was any important content missing
- Was the information conveyed clearly and accurately

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of information completeness.",
			prompt,
		);
	}
}
