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
      return { score: 1, reason: "无FAQ要求，默认满分" };
    }

    const prompt = `请评估对话中数字人对FAQ问题的回答准确度。

FAQ知识库：
${formatFaq(task)}

对话记录：
${formatDialogue(record)}

评估标准：
- 涉及FAQ的问题是否回答正确
- 回答是否包含关键信息
- 是否有错误或误导性信息

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的问答准确度评估专家。", prompt);
  }
}
