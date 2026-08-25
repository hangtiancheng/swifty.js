import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { OutputSettings } from "../config.js";
import type { EvaluationResult } from "../models/evaluation.js";
import { formatTimestamp } from "../report/common.js";
import { HtmlGenerator } from "../report/html-generator.js";
import { MarkdownGenerator } from "../report/markdown-generator.js";

export interface ReportPaths {
  readonly markdownPath: string;
  readonly htmlPath: string;
}

/** Inserts `_timestamp` before the extension, or appends it when absent. */
export function timestampedPath(basePath: string, timestamp: string): string {
  const match = /\.[^./\\]+$/.exec(basePath);
  if (match === null) {
    return `${basePath}_${timestamp}`;
  }
  return `${basePath.slice(0, match.index)}_${timestamp}${match[0]}`;
}

/** Writes timestamped Markdown and HTML reports and returns their paths. */
export async function generateReports(
  results: readonly EvaluationResult[],
  output: OutputSettings,
  now: () => Date = () => new Date(),
): Promise<ReportPaths> {
  const timestamp = formatTimestamp(now());
  const markdownPath = timestampedPath(output.markdownPath, timestamp);
  const htmlPath = timestampedPath(output.htmlPath, timestamp);

  const markdown = new MarkdownGenerator({ now }).generateBatch(results);
  const html = new HtmlGenerator({ now }).generateBatch(results);

  await mkdir(dirname(markdownPath), { recursive: true });
  await mkdir(dirname(htmlPath), { recursive: true });
  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(htmlPath, html, "utf8");

  return { markdownPath, htmlPath };
}
