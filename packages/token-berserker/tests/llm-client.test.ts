import { describe, expect, it } from "vitest";
import { LLMEmptyResponseError, LLMRateLimitError } from "@/llm/errors.js";
import { createFakeClient } from "./fakes.js";

describe("LLMClient.chat", () => {
	it("assembles system, history, and user messages in order", async () => {
		const { client, transport } = createFakeClient(["reply"]);
		const result = await client.chat({
			systemPrompt: "system-prompt",
			userMessage: "current-message",
			history: [
				{ role: "assistant", content: "earlier-model" },
				{ role: "user", content: "earlier-user" },
			],
		});

		expect(result).toBe("reply");
		expect(transport.requests).toHaveLength(1);
		expect(transport.requests[0]?.messages).toEqual([
			{ role: "system", content: "system-prompt" },
			{ role: "assistant", content: "earlier-model" },
			{ role: "user", content: "earlier-user" },
			{ role: "user", content: "current-message" },
		]);
	});

	it("retries rate-limited requests with exponential backoff", async () => {
		const { client, transport, sleeps } = createFakeClient([
			new LLMRateLimitError("429"),
			new LLMRateLimitError("429"),
			"recovered",
		]);

		const result = await client.chat({ systemPrompt: "s", userMessage: "u" });

		expect(result).toBe("recovered");
		expect(transport.requests).toHaveLength(3);
		expect(sleeps).toEqual([1000, 2000]);
	});

	it("throws the last rate-limit error once retries are exhausted", async () => {
		const { client, transport, sleeps } = createFakeClient([
			new LLMRateLimitError("first"),
			new LLMRateLimitError("second"),
		]);

		await expect(
			client.chat({ systemPrompt: "s", userMessage: "u", maxRetries: 2 }),
		).rejects.toThrow("second");
		expect(transport.requests).toHaveLength(2);
		expect(sleeps).toEqual([1000]);
	});

	it("propagates non-rate-limit errors immediately", async () => {
		const { client, transport } = createFakeClient([
			new LLMEmptyResponseError("empty"),
		]);

		await expect(
			client.chat({ systemPrompt: "s", userMessage: "u" }),
		).rejects.toThrow(LLMEmptyResponseError);
		expect(transport.requests).toHaveLength(1);
	});

	it("prefers the per-call token cap over the client default", async () => {
		const { client, transport } = createFakeClient(["ok", "ok"]);

		await client.chat({ systemPrompt: "s", userMessage: "u" });
		await client.chat({ systemPrompt: "s", userMessage: "u", maxTokens: 4096 });

		expect(transport.requests[0]?.maxTokens).toBe(4096);
		expect(transport.requests[1]?.maxTokens).toBe(4096);
	});
});
