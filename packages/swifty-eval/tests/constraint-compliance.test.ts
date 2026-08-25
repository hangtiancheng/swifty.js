import { describe, expect, it } from "vitest";
import {
	ConstraintComplianceEvaluator,
	evaluateCharLimit,
	evaluateForbiddenPhrases,
} from "@/evaluator/constraint-compliance.js";
import { createFakeClient, makeRecord, makeTask } from "./fakes.js";

const shortTurn = { roundNumber: 1, role: "model", content: "短消息" } as const;
const longTurn = {
	roundNumber: 2,
	role: "model",
	content: "这是一条很长很长很长很长很长很长很长很长的消息超过了三十个字限制",
} as const;

describe("evaluateCharLimit", () => {
	it("scores the share of replies within the limit", () => {
		const result = evaluateCharLimit([shortTurn, longTurn], 30);
		expect(result.score).toBe(0.5);
		expect(result.reason).toBe("1/2 replies exceed the 30-character limit");
	});

	it("passes trivially without a limit", () => {
		expect(evaluateCharLimit([shortTurn], undefined)).toEqual({
			score: 1,
			reason: "",
		});
	});

	it("reports full compliance", () => {
		expect(evaluateCharLimit([shortTurn], 30).reason).toBe(
			"All replies within the character limit",
		);
	});
});

describe("evaluateForbiddenPhrases", () => {
	it("penalizes each reply containing a forbidden phrase", () => {
		const turns = [
			{ roundNumber: 1, role: "model", content: "你好, 好的" } as const,
			{ roundNumber: 2, role: "model", content: "继续" } as const,
		];
		const result = evaluateForbiddenPhrases(turns, ["好的", "哈哈"]);
		expect(result.score).toBe(0.5);
		expect(result.reason).toBe("Forbidden phrases used: 好的");
	});

	it("passes trivially without forbidden phrases", () => {
		expect(evaluateForbiddenPhrases([shortTurn], [])).toEqual({
			score: 1,
			reason: "",
		});
	});

	it("never scores below zero", () => {
		const turns = [
			{ roundNumber: 1, role: "model", content: "好的, 哈哈, 嘿嘿" } as const,
		];
		const result = evaluateForbiddenPhrases(turns, ["好的", "哈哈", "嘿嘿"]);
		expect(result.score).toBe(0);
	});
});

describe("ConstraintComplianceEvaluator", () => {
	it("combines rule scores and the LLM tone score with fixed weights", async () => {
		const { client } = createFakeClient([
			'{"score": 0.5, "reason": "tone-ok"}',
		]);
		const evaluator = new ConstraintComplianceEvaluator(client, 1);

		const record = makeRecord([
			["model", "短消息"],
			["user", "嗯"],
			[
				"model",
				"这是一条很长很长很长很长很长很长很长很长的消息超过了三十个字限制",
			],
		]);
		const task = makeTask({
			constraints: { maxChars: 30, tone: "自然", forbiddenPhrases: [] },
		});

		const evaluation = await evaluator.evaluate(record, task);
		// char 0.5 * 0.4 + forbidden 1 * 0.3 + tone 0.5 * 0.3 = 0.65
		expect(evaluation.score).toBeCloseTo(0.65);
		expect(evaluation.reasons[0]).toContain(
			"Character limit: 1/2 replies exceed the 30-character limit",
		);
		expect(evaluation.reasons[0]).toContain("Tone: tone-ok");
	});

	it("returns a full score without any model turns and skips the LLM", async () => {
		const { client, transport } = createFakeClient([]);
		const evaluator = new ConstraintComplianceEvaluator(client, 1);

		const evaluation = await evaluator.evaluate(
			makeRecord([["user", "喂?"]]),
			makeTask(),
		);

		expect(evaluation.score).toBe(1);
		expect(evaluation.reasons).toEqual([
			"No model replies; full score by default",
		]);
		expect(transport.requests).toHaveLength(0);
	});

	it("only sends the first three model replies to the tone judge", async () => {
		const { client, transport } = createFakeClient([
			'{"score": 1, "reason": "ok"}',
		]);
		const evaluator = new ConstraintComplianceEvaluator(client, 1);

		const record = makeRecord([
			["model", "一"],
			["model", "二"],
			["model", "三"],
			["model", "四"],
		]);
		await evaluator.evaluate(record, makeTask());

		const prompt = transport.requests[0]?.messages.at(-1)?.content ?? "";
		expect(prompt).toContain("- 一");
		expect(prompt).toContain("- 三");
		expect(prompt).not.toContain("- 四");
	});
});
