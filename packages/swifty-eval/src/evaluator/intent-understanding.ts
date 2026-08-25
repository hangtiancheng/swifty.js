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
    const prompt = `请评估对话中数字人对用户意图的理解准确率。

对话记录：
${formatDialogue(record)}

评估标准：
- 每轮是否正确理解了用户表达的意图
- 回复是否针对用户的实际需求
- 是否有答非所问的情况
- 对模糊表达是否能合理推断意图

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的对话意图理解评估专家。", prompt);
  }
}
