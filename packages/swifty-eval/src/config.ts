import { readFile } from "node:fs/promises";
import { load } from "js-yaml";
import { z } from "zod";
import type { Language } from "./i18n/index.js";
import { DEFAULT_DIMENSION_WEIGHTS, type DimensionKey } from "./models/evaluation.js";
import { describeError } from "./utils/errors.js";

/** Thrown when the configuration file cannot be read, parsed, or validated. */
export class ConfigError extends Error {
  override readonly name = "ConfigError";
}

const WEIGHT_SUM_TOLERANCE = 1e-6;

const llmSettingsSchema = z.object({
  model: z.string().min(1),
  apiBase: z.string().min(1).optional(),
  apiKey: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().default(500),
});

const weightSchema = z.number().min(0).max(1);

const weightsSchema = z
  .object({
    flowCompletion: weightSchema,
    constraintCompliance: weightSchema,
    faqAccuracy: weightSchema,
    naturalness: weightSchema,
    intentUnderstanding: weightSchema,
    errorRecovery: weightSchema,
    coherence: weightSchema,
    infoCompleteness: weightSchema,
  })
  .refine(
    (weights) =>
      Math.abs(Object.values(weights).reduce((sum, weight) => sum + weight, 0) - 1) <=
      WEIGHT_SUM_TOLERANCE,
    { message: "Dimension weights must sum to 1.0" },
  );

const evaluationSettingsSchema = z.object({
  evalCount: z.number().int().min(1).default(3),
  maxWorkers: z.number().int().min(1).default(4),
  maxDialogueRounds: z.number().int().min(1).default(30),
  minDialogueRounds: z.number().int().min(0).default(4),
  weights: weightsSchema.default(DEFAULT_DIMENSION_WEIGHTS),
});

const outputSettingsSchema = z.object({
  markdownPath: z.string().min(1).default("output/evaluation_report.md"),
  htmlPath: z.string().min(1).default("output/evaluation_report.html"),
});

const configSchema = z.object({
  llm: llmSettingsSchema,
  evaluatorLlm: llmSettingsSchema.optional(),
  evaluation: evaluationSettingsSchema.prefault({}),
  output: outputSettingsSchema.prefault({}),
  language: z.enum(["zh", "en"]).default("en"),
});

export interface LLMSettings {
  readonly model: string;
  readonly apiBase?: string;
  readonly apiKey?: string;
  readonly temperature: number;
  readonly maxTokens: number;
}

export interface EvaluationSettings {
  readonly evalCount: number;
  readonly maxWorkers: number;
  readonly maxDialogueRounds: number;
  readonly minDialogueRounds: number;
  readonly weights: Readonly<Record<DimensionKey, number>>;
}

export interface OutputSettings {
  readonly markdownPath: string;
  readonly htmlPath: string;
}

export interface AppConfig {
  readonly llm: LLMSettings;
  /** Judge model settings; defaults to `llm` when not configured. */
  readonly evaluatorLlm: LLMSettings;
  readonly evaluation: EvaluationSettings;
  readonly output: OutputSettings;
  /** Locale for report copy and LLM output language. */
  readonly language: Language;
}

/** Parses and validates YAML configuration text. */
export function parseConfig(yamlText: string): AppConfig {
  let raw: unknown;
  try {
    raw = load(yamlText);
  } catch (error) {
    throw new ConfigError(`Failed to parse YAML configuration: ${describeError(error)}`);
  }

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    throw new ConfigError(`Invalid configuration:\n${z.prettifyError(result.error)}`);
  }

  const { llm, evaluatorLlm, evaluation, output, language } = result.data;
  return { llm, evaluatorLlm: evaluatorLlm ?? llm, evaluation, output, language };
}

/** Loads and validates the configuration file at `path`. */
export async function loadConfig(path: string): Promise<AppConfig> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    throw new ConfigError(`Cannot read config file "${path}": ${describeError(error)}`);
  }
  return parseConfig(text);
}
