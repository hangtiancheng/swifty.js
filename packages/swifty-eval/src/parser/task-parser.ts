import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { z } from "zod";
import type { LLMClient } from "../llm/llm-client.js";
import type { FlowStep, QAItem, TaskInstruction } from "../models/task.js";
import { describeError } from "../utils/errors.js";
import { extractJsonObject } from "../utils/json.js";

/** Thrown when the LLM extraction response cannot be parsed into a task. */
export class TaskParseError extends Error {
  override readonly name = "TaskParseError";
}

/** Thrown when the extracted task is missing required fields. */
export class TaskValidationError extends Error {
  override readonly name = "TaskValidationError";
  readonly missingFields: readonly string[];

  constructor(missingFields: readonly string[]) {
    super(`Task instruction is incomplete; missing fields: ${missingFields.join(", ")}`);
    this.missingFields = missingFields;
  }
}

const EXTRACTION_SYSTEM_PROMPT = "你是一个专业的文档结构化提取工具。只返回JSON，不要任何其他内容。";

function buildExtractionPrompt(content: string): string {
  return `请从以下任务指令文档中提取结构化信息，返回JSON格式。

文档内容：
${content}

请严格按以下JSON格式返回，不要返回其他内容：
{
  "role": "角色描述",
  "task": "任务描述",
  "opening_line": "开场白",
  "flow": [
    {"step_id": 1, "description": "步骤描述", "required": true},
    ...
  ],
  "faq": [
    {"question": "问题", "answer": "答案"},
    ...
  ],
  "constraints": {
    "max_chars": null或数字,
    "tone": "语气描述或null",
    "forbidden_phrases": ["禁止词1", "禁止词2"]
  }
}

注意：
- flow中提取所有步骤，包括子步骤
- faq如果文档中没有明确的FAQ/知识库部分，返回空数组
- max_chars从约束中提取字数限制，如"最多15-20个字"取20
- forbidden_phrases提取所有明确禁止使用的词语
- 只返回JSON，不要其他内容`;
}

// Wire format produced by the extraction prompt (snake_case, nullable fields).
const extractedTaskSchema = z.object({
  role: z.string().nullish(),
  task: z.string().nullish(),
  opening_line: z.string().nullish(),
  flow: z
    .array(
      z.object({
        step_id: z.number().int().nullish(),
        description: z.string().nullish(),
        required: z.boolean().nullish(),
      }),
    )
    .nullish(),
  faq: z
    .array(
      z.object({
        question: z.string().nullish(),
        answer: z.string().nullish(),
      }),
    )
    .nullish(),
  constraints: z
    .object({
      max_chars: z.number().int().positive().nullish(),
      tone: z.string().nullish(),
      forbidden_phrases: z.array(z.string()).nullish(),
    })
    .nullish(),
});

type ExtractedTask = z.infer<typeof extractedTaskSchema>;

function buildTask(data: ExtractedTask, taskId: string): TaskInstruction {
  const flow: FlowStep[] = (data.flow ?? []).map((step, index) => ({
    stepId: step.step_id ?? index + 1,
    description: step.description ?? "",
    required: step.required ?? true,
  }));

  const faq: QAItem[] = (data.faq ?? []).map((item) => ({
    question: item.question ?? "",
    answer: item.answer ?? "",
  }));

  const constraints = data.constraints ?? {};
  return {
    taskId,
    role: data.role ?? "",
    task: data.task ?? "",
    openingLine: data.opening_line ?? "",
    flow,
    faq,
    constraints: {
      maxChars: constraints.max_chars ?? undefined,
      tone: constraints.tone ?? undefined,
      forbiddenPhrases: constraints.forbidden_phrases ?? [],
    },
  };
}

function validateTask(task: TaskInstruction): void {
  const missing: string[] = [];
  if (task.role === "") {
    missing.push("role");
  }
  if (task.task === "") {
    missing.push("task");
  }
  if (task.openingLine === "") {
    missing.push("opening_line");
  }
  if (task.flow.length === 0) {
    missing.push("flow");
  }
  if (missing.length > 0) {
    throw new TaskValidationError(missing);
  }
}

/** Extracts a structured `TaskInstruction` from a Markdown document via LLM. */
export class TaskParser {
  private readonly llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async parseFromFile(filePath: string): Promise<TaskInstruction> {
    const content = await readFile(filePath, "utf8");
    const taskId = basename(filePath, extname(filePath));
    return this.parseFromText(content, taskId);
  }

  async parseFromText(text: string, taskId = "task"): Promise<TaskInstruction> {
    const response = await this.llmClient.chat({
      systemPrompt: EXTRACTION_SYSTEM_PROMPT,
      userMessage: buildExtractionPrompt(text),
      maxTokens: 4096,
    });

    let data: ExtractedTask;
    try {
      data = extractedTaskSchema.parse(extractJsonObject(response));
    } catch (error) {
      throw new TaskParseError(
        `LLM returned an unparsable task extraction: ${describeError(error)}`,
      );
    }

    const task = buildTask(data, taskId);
    validateTask(task);
    return task;
  }
}
