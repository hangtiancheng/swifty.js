import type { DialogueRecord } from "../models/dialogue.js";
import type { EvaluationResult, EvaluationScore } from "../models/evaluation.js";
import { escapeHtml, formatDateTime, TERMINATION_REASON_LABELS } from "./common.js";

export interface HtmlGeneratorOptions {
  /** Injectable clock for deterministic report headers. */
  readonly now?: () => Date;
}

const PAGE_STYLE = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { font-size: 24px; margin-bottom: 10px; }
        .header .meta { opacity: 0.8; font-size: 14px; }
        .content { padding: 30px; }
        .score-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .score-card h2 { color: #333; margin-bottom: 15px; }
        .total-score { font-size: 48px; font-weight: bold; color: #667eea; }
        .score-unit { font-size: 20px; color: #666; }
        .chart-container { position: relative; height: 300px; margin: 20px 0; }
        .dialogue { margin-top: 20px; }
        .dialogue h3 { color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .dialogue table, .score-card table { width: 100%; border-collapse: collapse; }
        .dialogue th, .dialogue td, .score-card th, .score-card td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .dialogue th, .score-card th { background: #f8f9fa; font-weight: 600; }
        .model { color: #667eea; font-weight: 500; }
        .user { color: #28a745; font-weight: 500; }
        .warning { background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .recommendations { margin-top: 20px; }
        .recommendations h3 { color: #333; margin-bottom: 10px; }
        .recommendations ul { padding-left: 20px; }
        .recommendations li { margin-bottom: 8px; color: #555; }
`;

function dimensionRows(scores: readonly EvaluationScore[]): string {
  return scores
    .map((score) => {
      const weighted = score.rawScore * score.weight * 100;
      const evidence =
        score.evidence.length > 0
          ? score.evidence.map((item) => escapeHtml(item)).join("<br>")
          : "-";
      return `                    <tr>
                        <td>${escapeHtml(score.label)}</td>
                        <td>${(score.rawScore * 100).toFixed(1)}%</td>
                        <td>${(score.weight * 100).toFixed(0)}%</td>
                        <td>${weighted.toFixed(1)}</td>
                        <td style="font-size: 12px; color: #666;">${evidence}</td>
                    </tr>`;
    })
    .join("\n");
}

function dialogueRows(record: DialogueRecord): string {
  let roundNumber = 0;
  return record.turns
    .map((turn) => {
      if (turn.role === "model") {
        roundNumber += 1;
      }
      const note =
        turn.evaluationNotes !== undefined && turn.evaluationNotes !== ""
          ? `<span class="warning">${escapeHtml(turn.evaluationNotes)}</span>`
          : "-";
      return `                        <tr>
                            <td>${roundNumber}</td>
                            <td class="${turn.role}">${turn.role}</td>
                            <td>${escapeHtml(turn.content)}</td>
                            <td>${note}</td>
                        </tr>`;
    })
    .join("\n");
}

function resultSection(result: EvaluationResult, index: number): string {
  const record = result.dialogueRecord;
  const chartId = `radarChart${index}`;
  return `            <div class="score-card">
                <h2>${escapeHtml(result.userProfileName)} — 综合评分</h2>
                <span class="total-score">${result.totalScore.toFixed(1)}</span>
                <span class="score-unit">/ 100</span>
                <div class="chart-container">
                    <canvas id="${chartId}"></canvas>
                </div>
                <table>
                    <tr>
                        <th>维度</th>
                        <th>得分</th>
                        <th>权重</th>
                        <th>加权得分</th>
                        <th>评估依据</th>
                    </tr>
${dimensionRows(result.dimensionScores)}
                </table>
            </div>

            <div class="dialogue">
                <h3>对话 ${index + 1}: ${escapeHtml(result.userProfileName)}</h3>
                <p>结束原因: ${TERMINATION_REASON_LABELS[record.terminationReason]}</p>
                <table>
                    <tr>
                        <th>轮次</th>
                        <th>角色</th>
                        <th>内容</th>
                        <th>评估备注</th>
                    </tr>
${dialogueRows(record)}
                </table>
            </div>`;
}

function chartScript(result: EvaluationResult, index: number): string {
  const labels = result.dimensionScores.map((score) => score.label);
  const data = result.dimensionScores.map((score) => Number((score.rawScore * 100).toFixed(1)));
  const chartId = `radarChart${index}`;
  return `        new Chart(document.getElementById(${JSON.stringify(chartId)}).getContext('2d'), {
            type: 'radar',
            data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                    label: ${JSON.stringify(`得分 - ${result.userProfileName}`)},
                    data: ${JSON.stringify(data)},
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: { scales: { r: { beginAtZero: true, max: 100 } } }
        });`;
}

/** Generates a self-contained HTML report with one radar chart per dialogue. */
export class HtmlGenerator {
  private readonly now: () => Date;

  constructor(options: HtmlGeneratorOptions = {}) {
    this.now = options.now ?? (() => new Date());
  }

  /** Generates an HTML report covering every evaluated profile. */
  generateBatch(results: readonly EvaluationResult[]): string {
    if (results.length === 0) {
      return this.generateEmpty();
    }

    const taskId = results[0]?.taskId ?? "";
    const averageScore =
      results.reduce((sum, result) => sum + result.totalScore, 0) / results.length;

    const allRecommendations = new Set<string>();
    for (const result of results) {
      for (const recommendation of result.recommendations) {
        allRecommendations.add(recommendation);
      }
    }
    const recommendationsHtml =
      allRecommendations.size > 0
        ? `            <div class="recommendations">
                <h3>改进建议</h3>
                <ul>${[...allRecommendations]
                  .sort()
                  .map((item) => `<li>${escapeHtml(item)}</li>`)
                  .join("\n")}</ul>
            </div>`
        : "";

    const sections = results.map((result, index) => resultSection(result, index)).join("\n\n");
    const scripts = results.map((result, index) => chartScript(result, index)).join("\n");

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>对话模型任务指令遵循评估报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js" integrity="sha384-XcdcwHqIPULERb2yDEM4R0XaQKU3YnDsrTmjACBZyfdVVqjh6xQ4/DCMd7XLcA6Y" crossorigin="anonymous"></script>
    <style>${PAGE_STYLE}    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>对话模型任务指令遵循评估报告</h1>
            <div class="meta">
                生成时间: ${formatDateTime(this.now())} | 任务ID: ${escapeHtml(taskId)} | 评估对话数: ${results.length} | 平均得分: ${averageScore.toFixed(1)}/100
            </div>
        </div>

        <div class="content">
${sections}

${recommendationsHtml}
        </div>
    </div>

    <script>
${scripts}
    </script>
</body>
</html>`;
  }

  private generateEmpty(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>对话模型任务指令遵循评估报告</title>
</head>
<body>
    <h1>暂无评估数据</h1>
</body>
</html>`;
  }
}
