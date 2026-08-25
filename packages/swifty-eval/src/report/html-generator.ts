import type { EvaluationResult } from "../models/evaluation.js";
import { renderEmptyHtmlReport, renderHtmlReport } from "./html-report.js";

export interface HtmlGeneratorOptions {
	/** Injectable clock for deterministic report headers. */
	readonly now?: () => Date;
}

/**
 * Generates a self-contained HTML report (React rendered to static markup,
 * Chart.js and Tailwind loaded from CDNs) with one radar chart per dialogue.
 */
export class HtmlGenerator {
	private readonly now: () => Date;

	constructor(options: HtmlGeneratorOptions = {}) {
		this.now = options.now ?? (() => new Date());
	}

	/** Generates an HTML report covering every evaluated profile. */
	generateBatch(results: readonly EvaluationResult[]): string {
		if (results.length === 0) {
			return renderEmptyHtmlReport();
		}
		return renderHtmlReport(results, this.now());
	}
}
