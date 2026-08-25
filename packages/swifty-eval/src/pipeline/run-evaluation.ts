import type { AppConfig } from "../config.js";
import { DialogueEngine } from "../engine/dialogue-engine.js";
import { createDefaultEvaluators } from "../evaluator/dimensions.js";
import { EvaluatorRegistry } from "../evaluator/registry.js";
import { Scorer } from "../evaluator/scorer.js";
import { LLMClient } from "../llm/llm-client.js";
import { DIMENSION_KEYS, type EvaluationResult } from "../models/evaluation.js";
import { TaskParser } from "../parser/task-parser.js";
import { selectProfiles } from "../simulator/profiles.js";
import { UserSimulator } from "../simulator/user-simulator.js";

export interface RunEvaluationOptions {
  readonly taskFile: string;
  readonly config: AppConfig;
  /** Profile names to evaluate; defaults to all built-in profiles. */
  readonly profileNames?: readonly string[];
  readonly logger?: (message: string) => void;
}

/**
 * Runs the complete pipeline: parse the task, simulate one dialogue per
 * profile, judge every dimension, and aggregate weighted results.
 */
export async function runEvaluation(options: RunEvaluationOptions): Promise<EvaluationResult[]> {
  const { config } = options;
  const log = options.logger ?? ((message: string) => console.log(message));

  const modelClient = LLMClient.fromSettings(config.llm);
  const evaluatorClient = LLMClient.fromSettings(config.evaluatorLlm);

  const parser = new TaskParser(modelClient);
  const task = await parser.parseFromFile(options.taskFile);

  const profiles = selectProfiles(options.profileNames);
  if (profiles.length === 0) {
    throw new Error(`No user profiles matched: ${(options.profileNames ?? []).join(", ")}`);
  }

  const registry = new EvaluatorRegistry(
    createDefaultEvaluators(evaluatorClient, config.evaluation.evalCount),
    config.evaluation.maxWorkers,
  );
  const scorer = new Scorer(config.evaluation.weights);

  const results: EvaluationResult[] = [];
  for (const profile of profiles) {
    log(`Running dialogue with ${profile.name}...`);

    const simulator = new UserSimulator({ profile, llmClient: modelClient });
    const engine = new DialogueEngine({ task, refusalJudge: evaluatorClient });

    const record = await engine.runDialogue({
      userSimulator: simulator,
      modelClient,
      maxRounds: config.evaluation.maxDialogueRounds,
      minRounds: config.evaluation.minDialogueRounds,
    });

    log(
      `  Evaluating (${config.evaluation.evalCount} rounds x ${DIMENSION_KEYS.length} dimensions)...`,
    );
    const evaluations = await registry.evaluateAll(record, task);

    const result = scorer.createResult({
      taskId: task.taskId,
      userProfileName: profile.name,
      evaluations,
      dialogueRecord: record,
    });
    results.push(result);

    log(`  Score: ${result.totalScore.toFixed(1)}`);
  }

  return results;
}
