import { describe, expect, it } from "vitest";
import { UserSimulator } from "@/simulator/user-simulator.js";
import { createFakeClient, makeProfile, makeTask } from "./fakes.js";
import { DialogueEngine, parseHangupSignal, resolvePlaceholders } from "@/engine/dialogue-engine.js";

function makeSimulator(script: readonly string[]) {
  const harness = createFakeClient(script);
  const simulator = new UserSimulator({ profile: makeProfile(), llmClient: harness.client });
  return { simulator, transport: harness.transport };
}

describe("resolvePlaceholders", () => {
  it("replaces known placeholders and keeps unknown ones", () => {
    const resolved = resolvePlaceholders("你好 ${rider_name}，参考 ${unknown}", {
      rider_name: "小王",
    });
    expect(resolved).toBe("你好 小王，参考 ${unknown}");
  });
});

describe("parseHangupSignal", () => {
  it("strips the marker and reports the hangup", () => {
    expect(parseHangupSignal("别打了[HANGUP]")).toEqual({ content: "别打了", hangup: true });
  });

  it("returns the message untouched without a marker", () => {
    expect(parseHangupSignal("好的")).toEqual({ content: "好的", hangup: false });
  });
});

describe("DialogueEngine.runDialogue", () => {
  it("opens with the resolved opening line and passes context only on round one", async () => {
    const { simulator, transport: simulatorTransport } = makeSimulator(["好", "嗯"]);
    const model = createFakeClient(["第二句"]);
    const judge = createFakeClient(["no", "no"]);
    const engine = new DialogueEngine({
      task: makeTask(),
      refusalJudge: judge.client,
      random: () => 0,
    });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 2,
      minRounds: 0,
    });

    expect(record.turns[0]).toEqual({
      roundNumber: 1,
      role: "model",
      content: "你好，请问是小王吗？",
    });
    const firstMessages = simulatorTransport.requests[0]?.messages ?? [];
    expect(firstMessages.at(-1)?.content).toContain("[上下文: 你正在接到测试站长的电话。");
    const secondMessages = simulatorTransport.requests[1]?.messages ?? [];
    expect(secondMessages.at(-1)?.content).toBe("第二句");
  });

  it("stops at maxRounds without generating an unused model reply", async () => {
    const { simulator } = makeSimulator(["好", "嗯"]);
    const model = createFakeClient(["第二句"]);
    const judge = createFakeClient(["no", "no"]);
    const engine = new DialogueEngine({ task: makeTask(), refusalJudge: judge.client });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 2,
      minRounds: 0,
    });

    expect(record.turns).toHaveLength(4);
    expect(record.terminationReason).toBe("maxRoundsReached");
    // One generation for round 2 only; the Python version wasted a final call.
    expect(model.transport.requests).toHaveLength(1);
    expect(judge.transport.requests).toHaveLength(2);
  });

  it("honors a hangup before minRounds without consulting the judge", async () => {
    const { simulator } = makeSimulator(["别再打了[HANGUP]"]);
    const model = createFakeClient([]);
    const judge = createFakeClient([]);
    const engine = new DialogueEngine({ task: makeTask(), refusalJudge: judge.client });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 10,
      minRounds: 4,
    });

    expect(record.terminationReason).toBe("userRefused");
    expect(record.turns).toHaveLength(2);
    expect(record.turns[1]?.content).toBe("别再打了");
    expect(judge.transport.requests).toHaveLength(0);
    expect(model.transport.requests).toHaveLength(0);
    expect(engine.stateMachine.isTerminal()).toBe(true);
  });

  it("ends via the refusal judge after minRounds", async () => {
    const { simulator } = makeSimulator(["我不需要"]);
    const model = createFakeClient([]);
    const judge = createFakeClient(["yes"]);
    const engine = new DialogueEngine({ task: makeTask(), refusalJudge: judge.client });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 10,
      minRounds: 0,
    });

    expect(record.terminationReason).toBe("userRefused");
    expect(judge.transport.requests).toHaveLength(1);
  });

  it("detects termination keywords after minRounds", async () => {
    const { simulator } = makeSimulator(["好，再见"]);
    const model = createFakeClient([]);
    const judge = createFakeClient(["no"]);
    const engine = new DialogueEngine({ task: makeTask(), refusalJudge: judge.client });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 10,
      minRounds: 0,
    });

    expect(record.terminationReason).toBe("userEndedConversation");
    expect(record.turns).toHaveLength(2);
  });

  it("ignores refusal signals before minRounds", async () => {
    const { simulator } = makeSimulator(["不用了再见", "好"]);
    const model = createFakeClient(["继续说明"]);
    const judge = createFakeClient(["no"]);
    const engine = new DialogueEngine({ task: makeTask(), refusalJudge: judge.client });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 2,
      minRounds: 1,
    });

    // Round 1 is below minRounds, so the dialogue continues to round 2.
    expect(record.turns).toHaveLength(4);
    expect(record.terminationReason).toBe("maxRoundsReached");
  });

  it("sends the task brief and prior turns when generating model replies", async () => {
    const { simulator } = makeSimulator(["好", "嗯"]);
    const model = createFakeClient(["第二句"]);
    const judge = createFakeClient(["no", "no"]);
    const task = makeTask();
    const engine = new DialogueEngine({
      task,
      refusalJudge: judge.client,
      random: () => 0,
    });

    await engine.runDialogue({
      userSimulator: simulator,
      modelClient: model.client,
      maxRounds: 2,
      minRounds: 0,
    });

    const request = model.transport.requests[0];
    const systemPrompt = request?.messages[0]?.content ?? "";
    expect(systemPrompt).toContain(`你是${task.role}。`);
    expect(systemPrompt).toContain("1. 告知合同生效");
    expect(systemPrompt).toContain("每次回复控制在30字以内");
    expect(systemPrompt).toContain("禁止使用：好的");
    expect(request?.messages).toEqual([
      { role: "system", content: systemPrompt },
      { role: "assistant", content: "你好，请问是小王吗？" },
      { role: "user", content: "好" },
    ]);
  });
});
