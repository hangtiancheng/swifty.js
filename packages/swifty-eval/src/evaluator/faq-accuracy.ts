import { getMessages } from "../i18n/index.js";
import type { DialogueRecord } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";
import { BaseEvaluator, type JudgeSample } from "./base-evaluator.js";
import { formatDialogue, formatFaq } from "./prompt-format.js";

/** Judges the factual accuracy of FAQ-related answers. */
export class FaqAccuracyEvaluator extends BaseEvaluator {
  readonly dimensionKey = "faqAccuracy";

  protected async evaluateOnce(
    record: DialogueRecord,
    task: TaskInstruction,
  ): Promise<JudgeSample> {
    if (task.faq.length === 0) {
      return { score: 1, reason: getMessages().noFaqReason };
    }

    const prompt = `Evaluate the accuracy of the digital human's answers to FAQ questions in the dialogue.

FAQ knowledge base:
${formatFaq(task)}

Dialogue transcript:
${formatDialogue(record)}

Evaluation criteria:
- Are FAQ-related questions answered correctly
- Do the answers include the key information
- Is there any incorrect or misleading information

Respond in JSON format: {"score": 0.0-1.0, "reason": "reason"}
Return JSON only.`;

    return this.requestJudgeVerdict(
      "You are an expert evaluator of question-answering accuracy.",
      prompt,
    );
  }
}
