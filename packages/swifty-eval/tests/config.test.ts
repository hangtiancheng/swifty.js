import { describe, expect, it } from "vitest";
import { ConfigError, parseConfig } from "@/config.js";
import { DEFAULT_DIMENSION_WEIGHTS } from "@/models/evaluation.js";

const MINIMAL_CONFIG = `
llm:
  model: "test-model"
`;

const FULL_CONFIG = `
llm:
  model: "model-a"
  apiBase: "https://example.com/v1"
  apiKey: "key-a"
  temperature: 0.9
  maxTokens: 256
evaluatorLlm:
  model: "model-b"
  temperature: 0.1
evaluation:
  evalCount: 5
  maxWorkers: 3
  maxDialogueRounds: 12
  minDialogueRounds: 2
  weights:
    flowCompletion: 0.30
    constraintCompliance: 0.20
    faqAccuracy: 0.15
    naturalness: 0.07
    intentUnderstanding: 0.07
    errorRecovery: 0.07
    coherence: 0.07
    infoCompleteness: 0.07
output:
  markdownPath: "reports/report.md"
  htmlPath: "reports/report.html"
`;

describe("parseConfig", () => {
  it("applies defaults for a minimal configuration", () => {
    const config = parseConfig(MINIMAL_CONFIG);
    expect(config.llm).toEqual({
      model: "test-model",
      temperature: 0.7,
      maxTokens: 500,
    });
    expect(config.evaluation.evalCount).toBe(3);
    expect(config.evaluation.maxWorkers).toBe(4);
    expect(config.evaluation.maxDialogueRounds).toBe(30);
    expect(config.evaluation.minDialogueRounds).toBe(4);
    expect(config.evaluation.weights).toEqual(DEFAULT_DIMENSION_WEIGHTS);
    expect(config.output.markdownPath).toBe("output/evaluation_report.md");
    expect(config.output.htmlPath).toBe("output/evaluation_report.html");
  });

  it("falls back to the model-under-test settings when evaluatorLlm is omitted", () => {
    const config = parseConfig(MINIMAL_CONFIG);
    expect(config.evaluatorLlm).toEqual(config.llm);
  });

  it("parses a full configuration", () => {
    const config = parseConfig(FULL_CONFIG);
    expect(config.llm.model).toBe("model-a");
    expect(config.llm.apiBase).toBe("https://example.com/v1");
    expect(config.evaluatorLlm.model).toBe("model-b");
    expect(config.evaluatorLlm.temperature).toBe(0.1);
    expect(config.evaluation.evalCount).toBe(5);
    expect(config.evaluation.minDialogueRounds).toBe(2);
    expect(config.output.markdownPath).toBe("reports/report.md");
  });

  it("rejects weights that do not sum to 1.0", () => {
    const text = FULL_CONFIG.replace("flowCompletion: 0.30", "flowCompletion: 0.50");
    expect(() => parseConfig(text)).toThrow(ConfigError);
    expect(() => parseConfig(text)).toThrow(/sum to 1\.0/);
  });

  it("rejects a missing llm section", () => {
    expect(() => parseConfig("output: {}")).toThrow(ConfigError);
  });

  it("rejects invalid YAML", () => {
    expect(() => parseConfig("llm: [unclosed")).toThrow(ConfigError);
  });
});
