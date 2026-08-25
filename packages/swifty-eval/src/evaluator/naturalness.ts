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
      return { score: 1, reason: "无模型回复，默认满分" };
    }

    const prompt = `请评估以下对话中数字人回复的自然度。

对话记录：
${formatDialogue(record)}

评估标准：
- 回复是否像真人对话，而非机械模板
- 用词是否自然流畅
- 是否有不自然的重复或套话
- 语句是否通顺连贯

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的对话自然度评估专家。", prompt);
  }
}
