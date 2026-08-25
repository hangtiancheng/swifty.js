import { describe, expect, it } from "vitest";
import type { LLMClient } from "@/llm/llm-client.js";
import type { DialogueRecord } from "@/models/dialogue.js";
import type { DimensionKey } from "@/models/evaluation.js";
import type { TaskInstruction } from "@/models/task.js";
import { createFakeClient, makeRecord, makeTask } from "./fakes.js";
import { BaseEvaluator, type JudgeSample } from "@/evaluator/base-evaluator.js";
import { EvaluatorRegistry } from "@/evaluator/registry.js";

class FixedEvaluator extends BaseEvaluator {
  readonly dimensionKey: DimensionKey;
  private readonly outcome: JudgeSample | Error;

  constructor(llmClient: LLMClient, dimensionKey: DimensionKey, outcome: JudgeSample | Error) {
    super(llmClient, 1);
    this.dimensionKey = dimensionKey;
    this.outcome = outcome;
  }

  protected evaluateOnce(_record: DialogueRecord, _task: TaskInstruction): Promise<JudgeSample> {
    if (this.outcome instanceof Error) {
      return Promise.reject(this.outcome);
    }
    return Promise.resolve(this.outcome);
  }
}

class CrashingEvaluator extends BaseEvaluator {
  readonly dimensionKey = "coherence";

  override evaluate(_record: DialogueRecord, _task: TaskInstruction): Promise<never> {
    return Promise.reject(new Error("registry-level crash"));
  }

  protected evaluateOnce(_record: DialogueRecord, _task: TaskInstruction): Promise<JudgeSample> {
    return Promise.reject(new Error("unreachable"));
  }
}

const record = makeRecord([
  ["model", "你好"],
  ["user", "好的"],
]);
const task = makeTask();

describe("EvaluatorRegistry.evaluateAll", () => {
  it("collects every dimension result", async () => {
    const { client } = createFakeClient([]);
    const registry = new EvaluatorRegistry(
      [
        new FixedEvaluator(client, "flowCompletion", { score: 0.9, reason: "good" }),
        new FixedEvaluator(client, "faqAccuracy", { score: 0.7, reason: "fine" }),
      ],
      2,
    );

    const results = await registry.evaluateAll(record, task);

    expect(results.get("flowCompletion")).toEqual({ score: 0.9, reasons: ["good"] });
    expect(results.get("faqAccuracy")).toEqual({ score: 0.7, reasons: ["fine"] });
  });

  it("isolates a crashed evaluator as a zero score with the error surfaced", async () => {
    const { client } = createFakeClient([]);
    const registry = new EvaluatorRegistry(
      [
        new FixedEvaluator(client, "flowCompletion", { score: 1, reason: "good" }),
        new CrashingEvaluator(client, 1),
      ],
      2,
    );

    const results = await registry.evaluateAll(record, task);

    expect(results.get("flowCompletion")?.score).toBe(1);
    const crashed = results.get("coherence");
    expect(crashed?.score).toBe(0);
    expect(crashed?.reasons[0]).toContain("registry-level crash");
  });
});
