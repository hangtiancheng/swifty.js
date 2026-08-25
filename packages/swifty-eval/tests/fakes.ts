import type { ChatModel, ChatRequest } from "@/llm/chat-model.js";
import { LLMClient } from "@/llm/llm-client.js";
import type {
  DialogueRecord,
  DialogueRole,
  UserProfile,
} from "@/models/dialogue.js";
import type { TaskInstruction } from "@/models/task.js";

export type FakeResponse = string | Error | ((request: ChatRequest) => string);

/** Scripted `ChatModel` that records every request it receives. */
export class FakeChatModel implements ChatModel {
  readonly requests: ChatRequest[] = [];
  private readonly script: FakeResponse[];

  constructor(script: readonly FakeResponse[]) {
    this.script = [...script];
  }

  complete(request: ChatRequest): Promise<string> {
    this.requests.push(request);
    const next = this.script.shift();
    if (next === undefined) {
      return Promise.reject(
        new Error(
          `FakeChatModel script exhausted after ${this.requests.length} requests`,
        ),
      );
    }
    if (next instanceof Error) {
      return Promise.reject(next);
    }
    if (typeof next === "function") {
      return Promise.resolve(next(request));
    }
    return Promise.resolve(next);
  }
}

export interface FakeClientHarness {
  readonly client: LLMClient;
  readonly transport: FakeChatModel;
  /** Milliseconds passed to the injected sleep, in call order. */
  readonly sleeps: number[];
}

/** Creates an `LLMClient` backed by a scripted transport and a no-op sleep. */
export function createFakeClient(
  script: readonly FakeResponse[],
): FakeClientHarness {
  const transport = new FakeChatModel(script);
  const sleeps: number[] = [];
  const client = new LLMClient({
    model: "fake-model",
    chatModel: transport,
    sleep: (ms: number) => {
      sleeps.push(ms);
      return Promise.resolve();
    },
  });
  return { client, transport, sleeps };
}

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: "测试用户",
    description: "test profile",
    traits: ["test"],
    refusalProbability: 0.05,
    questionProbability: 0.2,
    systemPrompt: "你是一个测试用户",
    ...overrides,
  };
}

export function makeTask(
  overrides: Partial<TaskInstruction> = {},
): TaskInstruction {
  return {
    taskId: "test-task",
    role: "测试站长",
    task: "通知骑手合同生效",
    openingLine: "你好, 请问是 ${rider_name} 吗?",
    flow: [
      { stepId: 1, description: "告知合同生效", required: true },
      { stepId: 2, description: "提醒注意安全", required: false },
    ],
    faq: [{ question: "如何退出", answer: "在App中取消" }],
    constraints: { maxChars: 30, tone: "自然口语", forbiddenPhrases: ["好的"] },
    ...overrides,
  };
}

export function makeRecord(
  turns: ReadonlyArray<readonly [DialogueRole, string]>,
  overrides: Partial<DialogueRecord> = {},
): DialogueRecord {
  let roundNumber = 0;
  return {
    taskId: "test-task",
    userProfile: makeProfile(),
    turns: turns.map(([role, content]) => {
      if (role === "model") {
        roundNumber += 1;
      }
      return { roundNumber: Math.max(roundNumber, 1), role, content };
    }),
    terminationReason: "maxRoundsReached",
    startTime: "2026-08-25T00:00:00.000Z",
    endTime: "2026-08-25T00:01:00.000Z",
    ...overrides,
  };
}
