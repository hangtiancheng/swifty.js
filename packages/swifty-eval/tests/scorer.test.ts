import { describe, expect, it } from "vitest";
import type { DimensionEvaluation, DimensionKey } from "@/models/evaluation.js";
import { makeRecord } from "./fakes.js";
import { Scorer } from "@/evaluator/scorer.js";

const record = makeRecord([
  ["model", "你好"],
  ["user", "好的"],
]);

function evaluations(
  entries: ReadonlyArray<readonly [DimensionKey, number]>,
): Map<DimensionKey, DimensionEvaluation> {
  return new Map(entries.map(([key, score]) => [key, { score, reasons: [`${key} reason`] }]));
}

describe("Scorer", () => {
  it("orders aggregated scores canonically regardless of map insertion order", () => {
    const scorer = new Scorer();
    const scores = scorer.aggregate(
      evaluations([
        ["faqAccuracy", 0.9],
        ["flowCompletion", 0.8],
        ["constraintCompliance", 0.7],
      ]),
    );
    expect(scores.map((score) => score.dimensionKey)).toEqual([
      "flowCompletion",
      "constraintCompliance",
      "faqAccuracy",
    ]);
    expect(scores[0]?.label).toBe("流程完成度");
    expect(scores[0]?.evidence).toEqual(["flowCompletion reason"]);
  });

  it("computes the weighted total on a 0-100 scale", () => {
    const scorer = new Scorer();
    const scores = scorer.aggregate(
      evaluations([
        ["flowCompletion", 0.8],
        ["constraintCompliance", 0.7],
        ["faqAccuracy", 0.9],
      ]),
    );
    // 0.8 * 0.3 + 0.7 * 0.2 + 0.9 * 0.15 = 0.515
    expect(scorer.calculateTotal(scores)).toBeCloseTo(51.5);
  });

  it("recommends improvements only for dimensions strictly below 0.7", () => {
    const scorer = new Scorer();
    const result = scorer.createResult({
      taskId: "t",
      userProfileName: "配合型用户",
      evaluations: evaluations([
        ["flowCompletion", 0.5],
        ["constraintCompliance", 0.7],
        ["naturalness", 0.95],
      ]),
      dialogueRecord: record,
    });
    expect(result.recommendations).toEqual(["建议提升流程完成度表现"]);
  });

  it("honors custom weights", () => {
    const scorer = new Scorer({
      flowCompletion: 0.5,
      constraintCompliance: 0.3,
      faqAccuracy: 0.2,
      naturalness: 0,
      intentUnderstanding: 0,
      errorRecovery: 0,
      coherence: 0,
      infoCompleteness: 0,
    });
    const scores = scorer.aggregate(
      evaluations([
        ["flowCompletion", 0.85],
        ["constraintCompliance", 0.7],
        ["faqAccuracy", 1],
      ]),
    );
    // 0.85 * 0.5 + 0.7 * 0.3 + 1 * 0.2 = 0.835
    expect(scorer.calculateTotal(scores)).toBeCloseTo(83.5);
  });
});
