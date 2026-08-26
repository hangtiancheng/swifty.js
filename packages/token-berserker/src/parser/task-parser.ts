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
		super(
			`Task instruction is incomplete; missing fields: ${missingFields.join(", ")}`,
		);
		this.missingFields = missingFields;
	}
}

const EXTRACTION_SYSTEM_PROMPT =
	"You are a professional document structuring extraction tool. Return JSON only, with no other content.";

function buildExtractionPrompt(content: string): string {
	return `Extract structured information from the following task instruction document and return it in JSON format.

Document content:
${content}

Return exactly the following JSON format and nothing else:
{
  "role": "role description",
  "task": "task description",
  "opening_line": "opening line",
  "flow": [
    {"step_id": 1, "description": "step description", "required": true},
    ...
  ],
  "faq": [
    {"question": "question", "answer": "answer"},
    ...
  ],
  "constraints": {
    "max_chars": null or a number,
    "tone": "tone description or null",
    "forbidden_phrases": ["forbidden phrase 1", "forbidden phrase 2"]
  }
}

Notes:
- Extract every step in flow, including sub-steps
- If the document has no explicit FAQ/knowledge base section, return an empty array for faq
- Extract the character limit for max_chars from the constraints, e.g. for "at most 15-20 characters" use 20
- Extract all explicitly forbidden phrases into forbidden_phrases
- Return JSON only, nothing else`;
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
