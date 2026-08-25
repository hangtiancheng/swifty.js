import type { TerminationReason } from "../models/dialogue.js";
import type { DimensionKey } from "../models/evaluation.js";

/**
 * Locale-dependent copy: report labels, evaluator reason templates, and
 * behavioral data. Function properties render parameterized strings.
 */
export interface Messages {
  /** `lang` attribute for generated HTML documents. */
  readonly htmlLang: string;
  readonly reportTitle: string;
  readonly noData: string;
  readonly generatedAtLabel: string;
  readonly taskIdLabel: string;
  readonly userProfileLabel: string;
  readonly totalScoreLabel: string;
  readonly averageScoreLabel: string;
  readonly dialoguesCountLabel: string;
  readonly dialogueRoundsLabel: string;
  readonly terminationReasonLabel: string;
  readonly evidenceLabel: string;
  readonly scoreLabel: string;
  readonly overallScoreSection: string;
  readonly dimensionScoresHeading: string;
  readonly dimensionDetailsSection: string;
  readonly evaluationOverviewSection: string;
  readonly dimensionEvidenceSection: string;
  readonly dialogueTranscriptSection: string;
  readonly recommendationsSection: string;
  readonly dialogueHeading: (index: number, profile: string) => string;
  readonly dimensionHeading: (
    label: string,
    rawPercent: string,
    weighted: string,
    weight: string,
  ) => string;
  readonly overallScoreHeading: (profile: string) => string;
  readonly chartDatasetLabel: (profile: string) => string;
  readonly recommendation: (label: string) => string;
  readonly dialogueTableHeaders: readonly [string, string, string, string];
  readonly dimensionTableHeaders: readonly [
    string,
    string,
    string,
    string,
    string,
  ];
  readonly dimensionLabels: Readonly<Record<DimensionKey, string>>;
  readonly terminationReasons: Readonly<Record<TerminationReason, string>>;
  readonly noModelTurnsReason: string;
  readonly noFlowReason: string;
  readonly noFaqReason: string;
  readonly charLimitViolationReason: (
    violations: number,
    total: number,
    maxChars: number,
  ) => string;
  readonly charLimitOkReason: string;
  readonly forbiddenPhrasesUsedReason: (phrases: string) => string;
  readonly forbiddenPhrasesOkReason: string;
  readonly charLimitReasonLabel: string;
  readonly forbiddenPhrasesReasonLabel: string;
  readonly toneReasonLabel: string;
  readonly evaluationFailedReason: (
    count: number,
    firstError: string,
  ) => string;
  readonly judgeFailuresNote: (count: number) => string;
  readonly evaluatorCrashedReason: (error: string) => string;
  /** Sample values substituted for the `${rider_name}` opening-line placeholder. */
  readonly sampleRiderNames: readonly string[];
}

export const ZH_MESSAGES: Messages = {
  htmlLang: "zh-CN",
  reportTitle: "对话模型任务指令遵循评估报告",
  noData: "暂无评估数据",
  generatedAtLabel: "生成时间",
  taskIdLabel: "任务 ID",
  userProfileLabel: "用户画像",
  totalScoreLabel: "总分",
  averageScoreLabel: "平均得分",
  dialoguesCountLabel: "评估对话数",
  dialogueRoundsLabel: "对话轮数",
  terminationReasonLabel: "结束原因",
  evidenceLabel: "评估依据",
  scoreLabel: "得分",
  overallScoreSection: "综合评分",
  dimensionScoresHeading: "各维度得分",
  dimensionDetailsSection: "维度详细评分",
  evaluationOverviewSection: "评估概览",
  dimensionEvidenceSection: "维度评分与评估依据",
  dialogueTranscriptSection: "完整对话记录",
  recommendationsSection: "改进建议",
  dialogueHeading: (index, profile) => `对话 ${index}: ${profile}`,
  dimensionHeading: (label, rawPercent, weighted, weight) =>
    `${label} (${rawPercent}%, 加权 ${weighted}/${weight})`,
  overallScoreHeading: (profile) => `${profile} — 综合评分`,
  chartDatasetLabel: (profile) => `得分 - ${profile}`,
  recommendation: (label) => `建议提升${label}表现`,
  dialogueTableHeaders: ["轮次", "角色", "内容", "评估备注"],
  dimensionTableHeaders: ["维度", "得分", "权重", "加权得分", "评估依据"],
  dimensionLabels: {
    flowCompletion: "流程完成度",
    constraintCompliance: "约束遵守度",
    faqAccuracy: "FAQ 准确度",
    naturalness: "对话自然度",
    intentUnderstanding: "意图理解准确率",
    errorRecovery: "错误恢复能力",
    coherence: "多轮连贯性",
    infoCompleteness: "信息完整度",
  },
  terminationReasons: {
    userRefused: "用户拒绝",
    userEndedConversation: "用户结束对话",
    maxRoundsReached: "达到最大轮次",
  },
  noModelTurnsReason: "无模型回复, 默认满分",
  noFlowReason: "无流程要求, 默认满分",
  noFaqReason: "无 FAQ 要求, 默认满分",
  charLimitViolationReason: (violations, total, maxChars) =>
    `${violations}/${total} 条超出 ${maxChars} 字限制`,
  charLimitOkReason: "全部符合字数限制",
  forbiddenPhrasesUsedReason: (phrases) => `使用了禁止词: ${phrases}`,
  forbiddenPhrasesOkReason: "未使用禁止词",
  charLimitReasonLabel: "字数约束",
  forbiddenPhrasesReasonLabel: "禁止词",
  toneReasonLabel: "语气风格",
  evaluationFailedReason: (count, firstError) =>
    `评估失败: ${count} 次评估调用均未返回有效结果 (${firstError})`,
  judgeFailuresNote: (count) => `注: ${count} 次评估调用失败, 未计入平均`,
  evaluatorCrashedReason: (error) => `评估执行异常: ${error}`,
  sampleRiderNames: ["小王", "小李", "小张", "小刘", "师傅"],
};

export const EN_MESSAGES: Messages = {
  htmlLang: "en",
  reportTitle:
    "Task-Instruction-Following Evaluation Report for Dialogue Models",
  noData: "No evaluation data yet",
  generatedAtLabel: "Generated at",
  taskIdLabel: "Task ID",
  userProfileLabel: "User profile",
  totalScoreLabel: "Total score",
  averageScoreLabel: "Average score",
  dialoguesCountLabel: "Dialogues",
  dialogueRoundsLabel: "Dialogue rounds",
  terminationReasonLabel: "Termination reason",
  evidenceLabel: "Evidence",
  scoreLabel: "Score",
  overallScoreSection: "Overall Score",
  dimensionScoresHeading: "Dimension Scores",
  dimensionDetailsSection: "Dimension Details",
  evaluationOverviewSection: "Evaluation Overview",
  dimensionEvidenceSection: "Dimension Scores and Evidence",
  dialogueTranscriptSection: "Full Dialogue Transcript",
  recommendationsSection: "Recommendations",
  dialogueHeading: (index, profile) => `Dialogue ${index}: ${profile}`,
  dimensionHeading: (label, rawPercent, weighted, weight) =>
    `${label} (${rawPercent}%, weighted ${weighted}/${weight})`,
  overallScoreHeading: (profile) => `${profile} — Overall Score`,
  chartDatasetLabel: (profile) => `Score - ${profile}`,
  recommendation: (label) => `Recommend improving ${label}`,
  dialogueTableHeaders: ["Round", "Role", "Content", "Evaluation Notes"],
  dimensionTableHeaders: [
    "Dimension",
    "Score",
    "Weight",
    "Weighted Score",
    "Evidence",
  ],
  dimensionLabels: {
    flowCompletion: "Flow Completion",
    constraintCompliance: "Constraint Compliance",
    faqAccuracy: "FAQ Accuracy",
    naturalness: "Naturalness",
    intentUnderstanding: "Intent Understanding",
    errorRecovery: "Error Recovery",
    coherence: "Coherence",
    infoCompleteness: "Information Completeness",
  },
  terminationReasons: {
    userRefused: "User refused",
    userEndedConversation: "User ended the conversation",
    maxRoundsReached: "Maximum rounds reached",
  },
  noModelTurnsReason: "No model replies; full score by default",
  noFlowReason: "No flow requirements; full score by default",
  noFaqReason: "No FAQ requirements; full score by default",
  charLimitViolationReason: (violations, total, maxChars) =>
    `${violations}/${total} replies exceed the ${maxChars}-character limit`,
  charLimitOkReason: "All replies within the character limit",
  forbiddenPhrasesUsedReason: (phrases) => `Forbidden phrases used: ${phrases}`,
  forbiddenPhrasesOkReason: "No forbidden phrases used",
  charLimitReasonLabel: "Character limit",
  forbiddenPhrasesReasonLabel: "Forbidden phrases",
  toneReasonLabel: "Tone",
  evaluationFailedReason: (count, firstError) =>
    `Evaluation failed: none of the ${count} judge calls returned a valid result (${firstError})`,
  judgeFailuresNote: (count) =>
    `Note: ${count} judge call(s) failed and were excluded from the average`,
  evaluatorCrashedReason: (error) => `Evaluator crashed: ${error}`,
  sampleRiderNames: ["Alex", "Sam", "Jordan", "Taylor", "Riley"],
};
