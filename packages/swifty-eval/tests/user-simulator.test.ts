import { describe, expect, it } from "vitest";
import { createFakeClient, makeProfile } from "./fakes.js";
import { buildSimulatorSystemPrompt, UserSimulator } from "@/simulator/user-simulator.js";

describe("buildSimulatorSystemPrompt", () => {
  it("appends numeric behavioral tendencies derived from the profile", () => {
    const prompt = buildSimulatorSystemPrompt(
      makeProfile({ refusalProbability: 0.05, questionProbability: 0.2 }),
    );
    expect(prompt).toContain("你是一个测试用户");
    expect(prompt).toContain("5% tendency to refuse or deflect requests");
    expect(prompt).toContain("20% tendency to proactively ask for details");
  });
});

describe("UserSimulator.generateResponse", () => {
  it("prefixes the additional context on the user message", async () => {
    const { client, transport } = createFakeClient(["好的"]);
    const simulator = new UserSimulator({ profile: makeProfile(), llmClient: client });

    await simulator.generateResponse("你好", "背景说明");

    const messages = transport.requests[0]?.messages ?? [];
    expect(messages.at(-1)?.content).toBe("[Context: 背景说明]\n\n你好");
  });

  it("passes the accumulated history on subsequent calls", async () => {
    const { client, transport } = createFakeClient(["回复一", "回复二"]);
    const simulator = new UserSimulator({ profile: makeProfile(), llmClient: client });

    await simulator.generateResponse("第一句");
    await simulator.generateResponse("第二句");

    const messages = transport.requests[1]?.messages ?? [];
    expect(messages).toEqual([
      { role: "system", content: buildSimulatorSystemPrompt(makeProfile()) },
      { role: "assistant", content: "第一句" },
      { role: "user", content: "回复一" },
      { role: "user", content: "第二句" },
    ]);
  });

  it("trims history to the configured window", async () => {
    const { client, transport } = createFakeClient(["r1", "r2", "r3"]);
    const simulator = new UserSimulator({
      profile: makeProfile(),
      llmClient: client,
      maxHistoryRounds: 1,
    });

    await simulator.generateResponse("m1");
    await simulator.generateResponse("m2");
    await simulator.generateResponse("m3");

    const messages = transport.requests[2]?.messages ?? [];
    // Only the previous round survives: system + 2 history + current user message.
    expect(messages).toHaveLength(4);
    expect(messages[1]).toEqual({ role: "assistant", content: "m2" });
    expect(messages[2]).toEqual({ role: "user", content: "r2" });
  });

  it("clears history on reset", async () => {
    const { client, transport } = createFakeClient(["r1", "r2"]);
    const simulator = new UserSimulator({ profile: makeProfile(), llmClient: client });

    await simulator.generateResponse("m1");
    simulator.resetHistory();
    await simulator.generateResponse("m2");

    expect(transport.requests[1]?.messages).toHaveLength(2);
  });
});
