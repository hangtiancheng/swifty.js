import { describe, expect, it } from "vitest";
import {
	BaseEvaluator,
	type JudgeSample,
	trimExtremes,
} from "@/evaluator/base-evaluator.js";
import type { DialogueRecord } from "@/models/dialogue.js";
import type { TaskInstruction } from "@/models/task.js";
import { createFakeClient, makeRecord, makeTask } from "./fakes.js";

class StubEvaluator extends BaseEvaluator {
	readonly dimensionKey = "naturalness";

	protected evaluateOnce(
		_record: DialogueRecord,
		_task: TaskInstruction,
	): Promise<JudgeSample> {
		return this.requestJudgeVerdict("system", "prompt");
	}
}

const record = makeRecord([
	["model", "你好"],
	["user", "好的"],
]);
const task = makeTask();

describe("trimExtremes", () => {
	it("drops one highest and one lowest sample, keeping reasons paired", () => {
		const kept = trimExtremes([
			{ score: 0.8, reason: "high" },
			{ score: 0.2, reason: "low" },
			{ score: 0.5, reason: "mid" },
		]);
		expect(kept).toEqual([{ score: 0.5, reason: "mid" }]);
	});

	it("removes only one instance per extreme when scores tie", () => {
		const kept = trimExtremes([
			{ score: 0.5, reason: "a" },
			{ score: 0.5, reason: "b" },
			{ score: 0.5, reason: "c" },
		]);
		expect(kept).toHaveLength(1);
	});
});

describe("BaseEvaluator.evaluate", () => {
	it("averages the remaining samples after trimming extremes", async () => {
		const { client } = createFakeClient([
			'{"score": 0.2, "reason": "r1"}',
			'{"score": 0.8, "reason": "r2"}',
			'{"score": 0.5, "reason": "r3"}',
		]);
		const evaluation = await new StubEvaluator(client, 3).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBeCloseTo(0.5);
		expect(evaluation.reasons).toEqual(["r3"]);
	});

	it("averages all samples when below the trimming threshold", async () => {
		const { client } = createFakeClient([
			'{"score": 0.2, "reason": "r1"}',
			'{"score": 0.6, "reason": "r2"}',
		]);
		const evaluation = await new StubEvaluator(client, 2).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBeCloseTo(0.4);
		expect(evaluation.reasons).toEqual(["r1", "r2"]);
	});

	it("parses fenced judge verdicts", async () => {
		const { client } = createFakeClient([
			'```json\n{"score": 0.9, "reason": "ok"}\n```',
		]);
		const evaluation = await new StubEvaluator(client, 1).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBeCloseTo(0.9);
	});

	it("coerces a quoted numeric score string", async () => {
		const { client } = createFakeClient([
			'{"score": "0.85", "reason": "quoted"}',
		]);
		const evaluation = await new StubEvaluator(client, 1).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBeCloseTo(0.85);
		expect(evaluation.reasons).toEqual(["quoted"]);
	});

	it("treats a non-numeric score string as a failed sample", async () => {
		const { client } = createFakeClient(['{"score": "high", "reason": "bad"}']);
		const evaluation = await new StubEvaluator(client, 1).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBe(0);
		expect(evaluation.reasons[0]).toContain("Evaluation failed");
	});

	it("clamps out-of-range scores into [0, 1]", async () => {
		const { client } = createFakeClient(['{"score": 1.5, "reason": "over"}']);
		const evaluation = await new StubEvaluator(client, 1).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBe(1);
	});

	it("excludes failed judge calls from the average instead of counting zero", async () => {
		const { client } = createFakeClient([
			'{"score": 0.6, "reason": "r1"}',
			"not json at all",
			'{"score": 0.8, "reason": "r3"}',
		]);
		const evaluation = await new StubEvaluator(client, 3).evaluate(
			record,
			task,
		);
		// Two valid samples remain, so no trimming applies: (0.6 + 0.8) / 2.
		expect(evaluation.score).toBeCloseTo(0.7);
		expect(evaluation.reasons).toContain("r1");
		expect(evaluation.reasons).toContain("r3");
		expect(
			evaluation.reasons.some((reason) =>
				reason.includes("1 judge call(s) failed"),
			),
		).toBe(true);
	});

	it("returns a zero score when every judge call fails", async () => {
		const { client } = createFakeClient(["bad", "bad", "bad"]);
		const evaluation = await new StubEvaluator(client, 3).evaluate(
			record,
			task,
		);
		expect(evaluation.score).toBe(0);
		expect(evaluation.reasons[0]).toContain("Evaluation failed");
	});

	it("rejects a non-positive evalCount", () => {
		const { client } = createFakeClient([]);
		expect(() => new StubEvaluator(client, 0)).toThrow(RangeError);
	});
});
