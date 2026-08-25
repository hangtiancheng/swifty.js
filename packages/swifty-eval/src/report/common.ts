import type { TerminationReason } from "../models/dialogue.js";

/** Chinese labels for termination reasons, used in generated reports. */
export const TERMINATION_REASON_LABELS: Readonly<Record<TerminationReason, string>> = {
  userRefused: "用户拒绝",
  userEndedConversation: "用户结束对话",
  maxRoundsReached: "达到最大轮次",
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Formats a date as `YYYY-MM-DD HH:MM:SS` for report headers. */
export function formatDateTime(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/** Formats a date as `YYYYMMDD_HHMMSS` for file names. */
export function formatTimestamp(date: Date): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** Escapes text for safe interpolation into HTML. */
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Escapes cell content so pipes and line breaks cannot break Markdown tables. */
export function escapeMarkdownTableCell(text: string): string {
  return text.replaceAll("|", "\\|").replace(/\r?\n/g, " ");
}
