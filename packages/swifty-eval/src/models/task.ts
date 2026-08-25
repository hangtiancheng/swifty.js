/** Structured representation of a parsed task instruction document. */

export interface FlowStep {
  readonly stepId: number;
  readonly description: string;
  readonly required: boolean;
}

export interface QAItem {
  readonly question: string;
  readonly answer: string;
}

export interface TaskConstraints {
  readonly maxChars?: number;
  readonly tone?: string;
  readonly forbiddenPhrases: readonly string[];
}

export interface TaskInstruction {
  readonly taskId: string;
  readonly role: string;
  readonly task: string;
  readonly openingLine: string;
  readonly flow: readonly FlowStep[];
  readonly faq: readonly QAItem[];
  readonly constraints: TaskConstraints;
}
