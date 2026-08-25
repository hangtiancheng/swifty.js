import { describe, expect, it } from "vitest";
import type { EvaluationResult, EvaluationScore } from "@/models/evaluation.js";
import { makeRecord } from "./fakes.js";
import { escapeHtml, escapeMarkdownTableCell, formatDateTime, formatTimestamp } from "@/report/common.js";
import { HtmlGenerator } from "@/report/html-generator.js";
import { MarkdownGenerator } from "@/report/markdown-generator.js";

const FIXED_DATE = new Date(2026, 7, 25, 12, 30, 45);
const now = (): Date => FIXED_DATE;

const scores: EvaluationScore[] = [
  {
    dimensionKey: "flowCompletion",
    label: "流程完成度",
    rawScore: 0.8,
    weight: 0.3,
    evidence: ["完成了大部分步骤"],
  },
  {
    dimensionKey: "constraintCompliance",
    label: "约束遵守度",
    rawScore: 0.6,
    weight: 0.2,
    evidence: ["字数基本合规"],
  },
];

function makeResult(profileName: string, content: string): EvaluationResult {
  return {
    taskId: "communicate",
    userProfileName: profileName,
    totalScore: 36,
    dimensionScores: scores,
    dialogueRecord: makeRecord(
      [
        ["model", content],
        ["user", "好的"],
      ],
      { terminationReason: "userRefused" },
    ),
    recommendations: ["建议提升约束遵守度表现"],
  };
}

describe("formatting helpers", () => {
  it("formats header dates and file timestamps", () => {
    expect(formatDateTime(FIXED_DATE)).toBe("2026-08-25 12:30:45");
    expect(formatTimestamp(FIXED_DATE)).toBe("20260825_123045");
  });

  it("escapes HTML metacharacters", () => {
    expect(escapeHtml('<b a="1">&\'')).toBe("&lt;b a=&quot;1&quot;&gt;&amp;&#39;");
  });

  it("escapes Markdown table cells", () => {
    expect(escapeMarkdownTableCell("a|b\nc")).toBe("a\\|b c");
  });
});

describe("MarkdownGenerator", () => {
  it("renders a batch report with overview, evidence, dialogues, and recommendations", () => {
    const generator = new MarkdownGenerator({ now });
    const report = generator.generateBatch([
      makeResult("配合型用户", "你好"),
      makeResult("对抗型用户", "喂"),
    ]);

    expect(report).toContain("**生成时间:** 2026-08-25 12:30:45");
    expect(report).toContain("**评估对话数:** 2");
    expect(report).toContain("| 配合型用户 | 36.0 | 80.0 | 60.0 | 0.0 |");
    expect(report).toContain("### 对话2：对抗型用户");
    expect(report).toContain("**结束原因:** 用户拒绝");
    expect(report).toContain("- 完成了大部分步骤");
    expect(report).toContain("- 建议提升约束遵守度表现");
  });

  it("keeps table rows intact when content contains pipes and newlines", () => {
    const generator = new MarkdownGenerator({ now });
    const report = generator.generateBatch([makeResult("配合型用户", "第一行|带竖线\n第二行")]);
    expect(report).toContain("| 第一行\\|带竖线 第二行 |");
  });

  it("renders a single-result report", () => {
    const generator = new MarkdownGenerator({ now });
    const report = generator.generate(makeResult("配合型用户", "你好"));
    expect(report).toContain("**总分:** 36.0/100");
    expect(report).toContain("**用户画像:** 配合型用户");
    expect(report).toContain("### 流程完成度");
  });
});

describe("HtmlGenerator", () => {
  it("renders one section and one radar chart per result", () => {
    const generator = new HtmlGenerator({ now });
    const html = generator.generateBatch([
      makeResult("配合型用户", "你好"),
      makeResult("对抗型用户", "喂"),
    ]);

    expect(html).toContain('id="radarChart0"');
    expect(html).toContain('id="radarChart1"');
    expect(html).toContain("配合型用户 — 综合评分");
    expect(html).toContain("对抗型用户 — 综合评分");
    expect(html).toContain('["流程完成度","约束遵守度"]');
    expect(html).toContain("[80,60]");
    expect(html).toContain("平均得分: 36.0/100");
  });

  it("escapes HTML in dialogue content", () => {
    const generator = new HtmlGenerator({ now });
    const html = generator.generateBatch([makeResult("配合型用户", '<script>alert("x")</script>')]);
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).not.toContain('<script>alert("x")</script>');
  });

  it("renders a placeholder page for empty results", () => {
    const html = new HtmlGenerator({ now }).generateBatch([]);
    expect(html).toContain("暂无评估数据");
  });
});
