import type { DialogueRecord, DialogueTurn } from "../models/dialogue.js";
import type { TaskInstruction } from "../models/task.js";

/** Renders the dialogue transcript as `role: content` lines for judge prompts. */
export function formatDialogue(record: DialogueRecord): string {
  return record.turns.map((turn) => `${turn.role}: ${turn.content}`).join("\n");
}

/** Renders flow steps as numbered lines. */
export function formatFlow(task: TaskInstruction): string {
  return task.flow.map((step) => `${step.stepId}. ${step.description}`).join("\n");
}

/** Renders flow steps with their required/optional marker. */
export function formatFlowWithRequired(task: TaskInstruction): string {
  return task.flow
    .map((step) => `${step.stepId}. ${step.description} (${step.required ? "必须" : "可选"})`)
    .join("\n");
}

/** Renders FAQ entries as Q/A pairs. */
export function formatFaq(task: TaskInstruction): string {
  return task.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n");
}

/** Returns only the model-side turns of a record. */
export function modelTurns(record: DialogueRecord): DialogueTurn[] {
  return record.turns.filter((turn) => turn.role === "model");
}
