import type { DialogueRecord } from "../models/dialogue.js";
import type { DimensionEvaluation, DimensionKey } from "../models/evaluation.js";
import type { TaskInstruction } from "../models/task.js";
import { mapWithConcurrency } from "../utils/concurrency.js";
import { describeError } from "../utils/errors.js";
import type { BaseEvaluator } from "./base-evaluator.js";

/** Runs all dimension evaluators with a bounded concurrency. */
export class EvaluatorRegistry {
  private readonly evaluators: readonly BaseEvaluator[];
  private readonly maxWorkers: number;

  constructor(evaluators: readonly BaseEvaluator[], maxWorkers = 4) {
    this.evaluators = evaluators;
    this.maxWorkers = maxWorkers;
  }

  /**
   * Evaluates every dimension. A crashed evaluator yields a zero score with
   * the error surfaced in its reasons instead of failing the whole run.
   */
  async evaluateAll(
    record: DialogueRecord,
    task: TaskInstruction,
  ): Promise<Map<DimensionKey, DimensionEvaluation>> {
    const entries = await mapWithConcurrency(
      this.evaluators,
      this.maxWorkers,
      async (evaluator): Promise<[DimensionKey, DimensionEvaluation]> => {
        try {
          return [evaluator.dimensionKey, await evaluator.evaluate(record, task)];
        } catch (error) {
          return [
            evaluator.dimensionKey,
            { score: 0, reasons: [`评估执行异常：${describeError(error)}`] },
          ];
        }
      },
    );
    return new Map(entries);
  }
}
