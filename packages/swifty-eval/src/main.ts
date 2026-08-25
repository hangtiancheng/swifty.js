#!/usr/bin/env node
import "dotenv/config";
import { access } from "node:fs/promises";
import { parseArgs } from "node:util";
import { loadConfig } from "./config.js";
import { configureI18n } from "./i18n/index.js";
import { DIMENSION_KEYS } from "./models/evaluation.js";
import { generateReports } from "./pipeline/generate-reports.js";
import { runEvaluation } from "./pipeline/run-evaluation.js";
import { describeError } from "./utils/errors.js";

const USAGE = `swifty-eval — LLM-as-Judge evaluation for task-instruction-following dialogue models

Usage:
  swifty-eval [--task <path>] [--config <path>] [--profiles <name>...]

Options:
  --task <path>       Task instruction file (default: data/communicate.md)
  --config <path>     Configuration file (default: config.yaml)
  --profiles <name>   User profile name; repeat the flag for multiple profiles
                      (default: all built-in profiles)
  -h, --help          Show this help message
`;

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      task: { type: "string", default: "data/communicate.md" },
      config: { type: "string", default: "config.yaml" },
      profiles: { type: "string", multiple: true },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    console.log(USAGE);
    return;
  }

  try {
    await access(values.task);
  } catch {
    throw new Error(`Task file not found: ${values.task}`);
  }

  const config = await loadConfig(values.config);
  configureI18n(config.language);

  console.log("Starting evaluation...");
  console.log(`Task file: ${values.task}`);
  console.log(`Model: ${config.llm.model}`);
  console.log(`Evaluator model: ${config.evaluatorLlm.model}`);
  console.log(`Eval count: ${config.evaluation.evalCount}`);
  console.log(`Dimensions: ${DIMENSION_KEYS.length}`);
  console.log(`Language: ${config.language}`);
  if (values.profiles !== undefined && values.profiles.length > 0) {
    console.log(`Profiles: ${values.profiles.join(", ")}`);
  }
  console.log("");

  const results = await runEvaluation({
    taskFile: values.task,
    config,
    profileNames: values.profiles,
  });

  const paths = await generateReports(results, config.output);
  console.log("\nReports generated:");
  console.log(`  Markdown: ${paths.markdownPath}`);
  console.log(`  HTML: ${paths.htmlPath}`);

  const averageScore =
    results.length > 0
      ? results.reduce((sum, result) => sum + result.totalScore, 0) / results.length
      : 0;
  console.log("\nEvaluation complete!");
  console.log(`Total dialogues: ${results.length}`);
  console.log(`Average score: ${averageScore.toFixed(1)}/100`);
}

main().catch((error: unknown) => {
  console.error(`Error: ${describeError(error)}`);
  process.exitCode = 1;
});
