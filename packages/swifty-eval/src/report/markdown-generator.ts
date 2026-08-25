import { getMessages } from "../i18n/index.js";
import type { DialogueRecord } from "../models/dialogue.js";
import type { EvaluationResult } from "../models/evaluation.js";
import { escapeMarkdownTableCell, formatDateTime } from "./common.js";

export interface MarkdownGeneratorOptions {
	/** Injectable clock for deterministic report headers. */
	readonly now?: () => Date;
}

function dialogueTableLines(record: DialogueRecord): string[] {
	const m = getMessages();
	const lines = [
		`| ${m.dialogueTableHeaders.join(" | ")} |`,
		"|------|------|------|----------|",
	];
	let roundNumber = 0;
	for (const turn of record.turns) {
		if (turn.role === "model") {
			roundNumber += 1;
		}
		const content = escapeMarkdownTableCell(turn.content);
		const notes =
			turn.evaluationNotes !== undefined && turn.evaluationNotes !== ""
				? escapeMarkdownTableCell(turn.evaluationNotes)
				: "-";
		lines.push(`| ${roundNumber} | ${turn.role} | ${content} | ${notes} |`);
	}
	return lines;
}

/** Generates Markdown evaluation reports. */
export class MarkdownGenerator {
	private readonly now: () => Date;

	constructor(options: MarkdownGeneratorOptions = {}) {
		this.now = options.now ?? (() => new Date());
	}

	/** Generates a report for a single evaluation result. */
	generate(result: EvaluationResult): string {
		const m = getMessages();
		const lines: string[] = [];
		const record = result.dialogueRecord;

		lines.push(`# ${m.reportTitle}`, "");
		lines.push(`**${m.generatedAtLabel}:** ${formatDateTime(this.now())}`);
		lines.push(`**${m.taskIdLabel}:** ${result.taskId}`);
		lines.push(`**${m.userProfileLabel}:** ${result.userProfileName}`, "");

		lines.push(`## 1. ${m.overallScoreSection}`, "");
		lines.push(
			`**${m.totalScoreLabel}:** ${result.totalScore.toFixed(1)}/100`,
			"",
		);

		lines.push(`### ${m.dimensionScoresHeading}`, "");
		for (const score of result.dimensionScores) {
			const weighted = score.rawScore * score.weight * 100;
			lines.push(
				`- **${score.label}:** ${weighted.toFixed(1)}/${(score.weight * 100).toFixed(0)} ` +
					`(${(score.rawScore * 100).toFixed(0)}%)`,
			);
		}
		lines.push("");

		lines.push(`## 2. ${m.dimensionDetailsSection}`, "");
		for (const score of result.dimensionScores) {
			lines.push(`### ${score.label}`, "");
			lines.push(
				`**${m.scoreLabel}:** ${(score.rawScore * 100).toFixed(1)}%`,
				"",
			);
			if (score.evidence.length > 0) {
				lines.push(`**${m.evidenceLabel}:**`, "");
				for (const evidence of score.evidence) {
					lines.push(`- ${evidence}`);
				}
				lines.push("");
			}
		}

		lines.push(`## 3. ${m.dialogueTranscriptSection}`, "");
		lines.push(
			`**${m.dialogueRoundsLabel}:** ${record.turns.filter((turn) => turn.role === "model").length}`,
		);
		lines.push(
			`**${m.terminationReasonLabel}:** ${m.terminationReasons[record.terminationReason]}`,
			"",
		);
		lines.push(...dialogueTableLines(record), "");

		if (result.recommendations.length > 0) {
			lines.push(`## 4. ${m.recommendationsSection}`, "");
			for (const recommendation of result.recommendations) {
				lines.push(`- ${recommendation}`);
			}
			lines.push("");
		}

		return lines.join("\n");
	}

	/** Generates a combined report covering every evaluated profile. */
	generateBatch(results: readonly EvaluationResult[]): string {
		const m = getMessages();
		const lines: string[] = [];

		lines.push(`# ${m.reportTitle}`, "");
		lines.push(`**${m.generatedAtLabel}:** ${formatDateTime(this.now())}`);
		lines.push(`**${m.dialoguesCountLabel}:** ${results.length}`, "");

		lines.push(`## 1. ${m.evaluationOverviewSection}`, "");
		lines.push(
			`| ${m.userProfileLabel} | ${m.totalScoreLabel} | ${m.dimensionLabels.flowCompletion} | ` +
				`${m.dimensionLabels.constraintCompliance} | ${m.dimensionLabels.faqAccuracy} |`,
		);
		lines.push("|----------|------|------------|------------|-----------|");
		for (const result of results) {
			const byKey = new Map(
				result.dimensionScores.map((score) => [
					score.dimensionKey,
					score.rawScore * 100,
				]),
			);
			lines.push(
				`| ${result.userProfileName} | ${result.totalScore.toFixed(1)} | ` +
					`${(byKey.get("flowCompletion") ?? 0).toFixed(1)} | ` +
					`${(byKey.get("constraintCompliance") ?? 0).toFixed(1)} | ` +
					`${(byKey.get("faqAccuracy") ?? 0).toFixed(1)} |`,
			);
		}
		lines.push("");

		const averageScore =
			results.length > 0
				? results.reduce((sum, result) => sum + result.totalScore, 0) /
					results.length
				: 0;
		lines.push(
			`**${m.averageScoreLabel}:** ${averageScore.toFixed(1)}/100`,
			"",
		);

		lines.push(`## 2. ${m.dimensionEvidenceSection}`, "");
		for (const result of results) {
			if (results.length > 1) {
				lines.push(`### ${result.userProfileName}`, "");
			}
			for (const score of result.dimensionScores) {
				const weighted = score.rawScore * score.weight * 100;
				lines.push(
					`#### ${m.dimensionHeading(
						score.label,
						(score.rawScore * 100).toFixed(1),
						weighted.toFixed(1),
						(score.weight * 100).toFixed(0),
					)}`,
					"",
				);
				if (score.evidence.length > 0) {
					for (const evidence of score.evidence) {
						lines.push(`- ${evidence}`);
					}
					lines.push("");
				}
			}
		}

		lines.push(`## 3. ${m.dialogueTranscriptSection}`, "");
		results.forEach((result, index) => {
			const record = result.dialogueRecord;
			lines.push(
				`### ${m.dialogueHeading(index + 1, result.userProfileName)}`,
				"",
			);
			lines.push(
				`**${m.totalScoreLabel}:** ${result.totalScore.toFixed(1)}/100`,
			);
			lines.push(
				`**${m.terminationReasonLabel}:** ${m.terminationReasons[record.terminationReason]}`,
				"",
			);
			lines.push(...dialogueTableLines(record), "", "---", "");
		});

		const allRecommendations = new Set<string>();
		for (const result of results) {
			for (const recommendation of result.recommendations) {
				allRecommendations.add(recommendation);
			}
		}
		if (allRecommendations.size > 0) {
			lines.push(`## 4. ${m.recommendationsSection}`, "");
			for (const recommendation of [...allRecommendations].sort()) {
				lines.push(`- ${recommendation}`);
			}
			lines.push("");
		}

		return lines.join("\n");
	}
}
