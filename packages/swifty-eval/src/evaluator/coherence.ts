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
    const prompt = `请评估以下对话中数字人回复的多轮连贯性。

对话记录：
${formatDialogue(record)}

评估标准：
- 上下文是否前后一致，无自相矛盾
- 是否记住了之前对话中提到的信息
- 回复之间是否有逻辑连贯性
- 是否出现重复或遗忘之前内容的情况

请以JSON格式返回：{"score": 0.0-1.0, "reason": "理由"}
只返回JSON。`;

    return this.requestJudgeVerdict("你是专业的对话连贯性评估专家。", prompt);
  }
}
