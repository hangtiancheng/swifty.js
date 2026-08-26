import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue } from "./prompt-format.js";

/** Judges multi-round consistency: no contradictions or forgotten context. */
export class CoherenceEvaluator extends BaseEvaluator {
	readonly dimensionKey = "coherence";

	protected async evaluateOnce(
		record: DialogueRecord,
		_task: TaskInstruction,
	): Promise<JudgeSample> {
		const prompt = `Evaluate the multi-turn coherence of the digital human's replies in the following dialogue.

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- The context stays consistent throughout, without self-contradiction
- Information mentioned earlier in the conversation is remembered
- The replies are logically connected
- Earlier content is neither repeated nor forgotten

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

		return this.requestJudgeVerdict(
			"You are an expert evaluator of dialogue coherence.",
			prompt,
		);
	}
}
