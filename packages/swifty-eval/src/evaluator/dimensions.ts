import type { LLMClient } from "../llm/llm-client.js";
import type { BaseEvaluator } from "./base-evaluator.js";
import { CoherenceEvaluator } from "./coherence.js";
import { ConstraintComplianceEvaluator } from "./constraint-compliance.js";
import { ErrorRecoveryEvaluator } from "./error-recovery.js";
import { FaqAccuracyEvaluator } from "./faq-accuracy.js";
import { FlowCompletionEvaluator } from "./flow-completion.js";
import { InfoCompletenessEvaluator } from "./info-completeness.js";
import { IntentUnderstandingEvaluator } from "./intent-understanding.js";
import { NaturalnessEvaluator } from "./naturalness.js";

export { CoherenceEvaluator } from "./coherence.js";
export {
  ConstraintComplianceEvaluator,
  evaluateCharLimit,
  evaluateForbiddenPhrases,
  type RuleCheckResult,
} from "./constraint-compliance.js";
export { ErrorRecoveryEvaluator } from "./error-recovery.js";
export { FaqAccuracyEvaluator } from "./faq-accuracy.js";
export { FlowCompletionEvaluator } from "./flow-completion.js";
export { InfoCompletenessEvaluator } from "./info-completeness.js";
export { IntentUnderstandingEvaluator } from "./intent-understanding.js";
export { NaturalnessEvaluator } from "./naturalness.js";

/** Creates one evaluator per dimension, sharing the judge client. */
export function createDefaultEvaluators(llmClient: LLMClient, evalCount: number): BaseEvaluator[] {
  return [
    new FlowCompletionEvaluator(llmClient, evalCount),
    new ConstraintComplianceEvaluator(llmClient, evalCount),
    new FaqAccuracyEvaluator(llmClient, evalCount),
    new NaturalnessEvaluator(llmClient, evalCount),
    new IntentUnderstandingEvaluator(llmClient, evalCount),
    new ErrorRecoveryEvaluator(llmClient, evalCount),
    new CoherenceEvaluator(llmClient, evalCount),
    new InfoCompletenessEvaluator(llmClient, evalCount),
  ];
}
