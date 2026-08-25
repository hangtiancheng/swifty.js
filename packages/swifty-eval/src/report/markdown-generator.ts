import type { DialogueRecord } from "../models/dialogue.js";
import type { EvaluationResult } from "../models/evaluation.js";
import { escapeMarkdownTableCell, formatDateTime, TERMINATION_REASON_LABELS } from "./common.js";

export interface MarkdownGeneratorOptions {
  /** Injectable clock for deterministic report headers. */
  readonly now?: () => Date;
}

function dialogueTableLines(record: DialogueRecord): string[] {
  const lines = ["| 轮次 | 角色 | 内容 | 评估备注 |", "|------|------|------|----------|"];
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
    const lines: string[] = [];
    const record = result.dialogueRecord;

    lines.push("# 对话模型任务指令遵循评估报告", "");
    lines.push(`**生成时间:** ${formatDateTime(this.now())}`);
    lines.push(`**任务ID:** ${result.taskId}`);
    lines.push(`**用户画像:** ${result.userProfileName}`, "");

    lines.push("## 1. 综合评分", "");
    lines.push(`**总分:** ${result.totalScore.toFixed(1)}/100`, "");

    lines.push("### 各维度得分", "");
    for (const score of result.dimensionScores) {
      const weighted = score.rawScore * score.weight * 100;
      lines.push(
        `- **${score.label}:** ${weighted.toFixed(1)}/${(score.weight * 100).toFixed(0)} ` +
          `(${(score.rawScore * 100).toFixed(0)}%)`,
      );
    }
    lines.push("");

    lines.push("## 2. 维度详细评分", "");
    for (const score of result.dimensionScores) {
      lines.push(`### ${score.label}`, "");
      lines.push(`**得分:** ${(score.rawScore * 100).toFixed(1)}%`, "");
      if (score.evidence.length > 0) {
        lines.push("**评估依据:**", "");
        for (const evidence of score.evidence) {
          lines.push(`- ${evidence}`);
        }
        lines.push("");
      }
    }

    lines.push("## 3. 完整对话记录", "");
    lines.push(`**对话轮数:** ${record.turns.filter((turn) => turn.role === "model").length}`);
    lines.push(`**结束原因:** ${TERMINATION_REASON_LABELS[record.terminationReason]}`, "");
    lines.push(...dialogueTableLines(record), "");

    if (result.recommendations.length > 0) {
      lines.push("## 4. 改进建议", "");
      for (const recommendation of result.recommendations) {
        lines.push(`- ${recommendation}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  /** Generates a combined report covering every evaluated profile. */
  generateBatch(results: readonly EvaluationResult[]): string {
    const lines: string[] = [];

    lines.push("# 对话模型任务指令遵循评估报告", "");
    lines.push(`**生成时间:** ${formatDateTime(this.now())}`);
    lines.push(`**评估对话数:** ${results.length}`, "");

    lines.push("## 1. 评估概览", "");
    lines.push("| 用户画像 | 总分 | 流程完成度 | 约束遵守度 | FAQ准确度 |");
    lines.push("|----------|------|------------|------------|-----------|");
    for (const result of results) {
      const byKey = new Map(
        result.dimensionScores.map((score) => [score.dimensionKey, score.rawScore * 100]),
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
        ? results.reduce((sum, result) => sum + result.totalScore, 0) / results.length
        : 0;
    lines.push(`**平均得分:** ${averageScore.toFixed(1)}/100`, "");

    lines.push("## 2. 维度评分与评估依据", "");
    for (const result of results) {
      if (results.length > 1) {
        lines.push(`### ${result.userProfileName}`, "");
      }
      for (const score of result.dimensionScores) {
        const weighted = score.rawScore * score.weight * 100;
        lines.push(
          `#### ${score.label}（${(score.rawScore * 100).toFixed(1)}%，加权 ` +
            `${weighted.toFixed(1)}/${(score.weight * 100).toFixed(0)}）`,
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

    lines.push("## 3. 完整对话记录", "");
    results.forEach((result, index) => {
      const record = result.dialogueRecord;
      lines.push(`### 对话${index + 1}：${result.userProfileName}`, "");
      lines.push(`**总分:** ${result.totalScore.toFixed(1)}/100`);
      lines.push(`**结束原因:** ${TERMINATION_REASON_LABELS[record.terminationReason]}`, "");
      lines.push(...dialogueTableLines(record), "", "---", "");
    });

    const allRecommendations = new Set<string>();
    for (const result of results) {
      for (const recommendation of result.recommendations) {
        allRecommendations.add(recommendation);
      }
    }
    if (allRecommendations.size > 0) {
      lines.push("## 4. 改进建议", "");
      for (const recommendation of [...allRecommendations].sort()) {
        lines.push(`- ${recommendation}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}
