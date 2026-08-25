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
      return { score: 1, reason: "无流程要求，默认满分" };
    }

    const prompt = `请评估以下对话是否完成了规定的流程步骤。

规定流程：
${formatFlowWithRequired(task)}

对话记录：
${formatDialogue(record)}

评估标准：
- 必须步骤是否都完成了
- 步骤是否按正确顺序执行
- 每个步骤的执行质量如何

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的对话流程评估专家。", prompt);
  }
}
