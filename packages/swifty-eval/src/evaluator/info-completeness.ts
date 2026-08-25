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
    const flowDescription = task.flow.length > 0 ? formatFlow(task) : "无";
    const faqDescription = task.faq.length > 0 ? formatFaq(task) : "无";

    const prompt = `请评估对话中数字人是否完整传达了所有关键信息。

任务流程：
${flowDescription}

FAQ知识：
${faqDescription}

对话记录：
${formatDialogue(record)}

评估标准：
- 该传达的关键信息是否都传达到位
- 是否有遗漏重要内容
- 信息传达是否清晰准确

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的信息完整度评估专家。", prompt);
  }
}
