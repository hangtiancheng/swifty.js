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
      return { score: 1, reason: "无流程要求，默认满分" };
    }

    const prompt = `请评估对话中数字人的错误恢复能力。

规定流程：
${formatFlow(task)}

对话记录：
${formatDialogue(record)}

评估标准：
- 用户偏离流程时，数字人是否能识别
- 是否能有效引导用户回到正确流程
- 引导方式是否自然不生硬
- 如果用户没有偏离流程，给满分

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的对话错误恢复评估专家。", prompt);
  }
}
