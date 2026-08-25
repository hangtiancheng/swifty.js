import { describe, expect, it } from "vitest";
import { createFakeClient } from "./fakes.js";
import {
  TaskParseError,
  TaskParser,
  TaskValidationError,
} from "@/parser/task-parser.js";

const VALID_EXTRACTION = `\`\`\`json
{
  "role": "站长",
  "task": "通知合同生效",
  "opening_line": "你好, 请问是 \${rider_name} 吗?",
  "flow": [
    {"step_id": 1, "description": "告知生效", "required": true},
    {"description": "提醒安全"}
  ],
  "faq": [
    {"question": "如何退出", "answer": "在 App 取消"}
  ],
  "constraints": {
    "max_chars": 30,
    "tone": "自然口语",
    "forbidden_phrases": ["好的"]
  }
}
\`\`\``;

describe("TaskParser.parseFromText", () => {
  it("builds a task from a fenced JSON extraction", async () => {
    const { client } = createFakeClient([VALID_EXTRACTION]);
    const parser = new TaskParser(client);

    const task = await parser.parseFromText("# 文档", "my-task");

    expect(task.taskId).toBe("my-task");
    expect(task.role).toBe("站长");
    expect(task.openingLine).toContain("${rider_name}");
    expect(task.flow).toEqual([
      { stepId: 1, description: "告知生效", required: true },
      { stepId: 2, description: "提醒安全", required: true },
    ]);
    expect(task.faq).toEqual([{ question: "如何退出", answer: "在 App 取消" }]);
    expect(task.constraints).toEqual({
      maxChars: 30,
      tone: "自然口语",
      forbiddenPhrases: ["好的"],
    });
  });

  it("requests the extraction with an enlarged token budget", async () => {
    const { client, transport } = createFakeClient([VALID_EXTRACTION]);
    await new TaskParser(client).parseFromText("# 文档");
    expect(transport.requests[0]?.maxTokens).toBe(4096);
  });

  it("reports every missing required field", async () => {
    const { client } = createFakeClient([
      '{"task": "t", "opening_line": "o", "flow": []}',
    ]);
    const parser = new TaskParser(client);

    const error = await parser
      .parseFromText("# 文档")
      .catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(TaskValidationError);
    if (error instanceof TaskValidationError) {
      expect(error.missingFields).toEqual(["role", "flow"]);
    }
  });

  it("wraps unparsable responses in TaskParseError", async () => {
    const { client } = createFakeClient(["definitely not json"]);
    await expect(
      new TaskParser(client).parseFromText("# 文档"),
    ).rejects.toThrow(TaskParseError);
  });

  it("tolerates null constraints and missing faq", async () => {
    const { client } = createFakeClient([
      '{"role": "r", "task": "t", "opening_line": "o", "flow": [{"step_id": 1, "description": "d"}], "constraints": null}',
    ]);
    const task = await new TaskParser(client).parseFromText("# 文档");
    expect(task.faq).toEqual([]);
    expect(task.constraints).toEqual({
      maxChars: undefined,
      tone: undefined,
      forbiddenPhrases: [],
    });
  });
});

describe("TaskParser.parseFromFile", () => {
  it("derives the task id from the file name", async () => {
    const { client } = createFakeClient([VALID_EXTRACTION]);
    const task = await new TaskParser(client).parseFromFile(
      "data/communicate.md",
    );
    expect(task.taskId).toBe("communicate");
  });
});
