import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getMessages } from "../i18n/index.js";
import type { DialogueRecord, DialogueTurn } from "../models/dialogue.js";
import type {
	EvaluationResult,
	EvaluationScore,
} from "../models/evaluation.js";
import { formatDateTime } from "./common.js";

/** Raw dimension score (in [0, 1]) at or above which a dimension passes. */
const PASS_THRESHOLD = 0.7;

const CHART_JS_SRC =
	"https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js";
const CHART_JS_INTEGRITY =
	"sha384-XcdcwHqIPULERb2yDEM4R0XaQKU3YnDsrTmjACBZyfdVVqjh6xQ4/DCMd7XLcA6Y";
const TAILWIND_SRC = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
const CHART_DATA_ID = "swifty-eval-chart-data";

/**
 * Design tokens and the few rules Tailwind utilities cannot express
 * (details marker, print behavior). Compiled by the Tailwind v4 browser
 * build via `type="text/tailwindcss"`.
 */
const THEME_CSS = `
@theme {
  --color-ink: #173753;
  --color-paper: #f0f7fd;
  --color-card: #ffffff;
  --color-line: #d7e6f4;
  --color-mist: #eaf4fc;
  --color-subtle: #5a7184;
  --color-brand: #2e90fa;
  --color-pass: #0e9f6e;
  --color-warn: #d97706;
  --font-display: "Avenir Next", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --font-data: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
}
details.transcript > summary { list-style: none; cursor: pointer; }
details.transcript > summary::-webkit-details-marker { display: none; }
details.transcript > summary .caret { transition: transform 0.15s ease; }
details.transcript[open] > summary .caret { transform: rotate(90deg); }
@media (prefers-reduced-motion: reduce) {
  details.transcript > summary .caret { transition: none; }
}
@media print {
  body { background: #ffffff; }
  .report-card { box-shadow: none; break-inside: avoid; }
}
`;

/**
 * Initializes one radar chart per canvas from the JSON payload element.
 * Static text with no interpolated data, so it is safe to inline.
 */
const CHART_BOOTSTRAP = `
(function () {
  var dataElement = document.getElementById("${CHART_DATA_ID}");
  if (!dataElement || typeof Chart === "undefined") return;
  var charts = JSON.parse(dataElement.textContent || "[]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function wrapLabel(label) {
    if (label.length <= 14 || label.indexOf(" ") === -1) return label;
    var words = label.split(" ");
    var lines = [];
    var current = words[0];
    for (var i = 1; i < words.length; i++) {
      if ((current + " " + words[i]).length <= 14) current += " " + words[i];
      else { lines.push(current); current = words[i]; }
    }
    lines.push(current);
    return lines;
  }
  charts.forEach(function (chart) {
    var canvas = document.getElementById(chart.canvasId);
    if (!canvas) return;
    new Chart(canvas, {
      type: "radar",
      data: {
        labels: chart.labels.map(wrapLabel),
        datasets: [{
          label: chart.datasetLabel,
          data: chart.data,
          backgroundColor: "rgba(46, 144, 250, 0.15)",
          borderColor: "rgba(46, 144, 250, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(46, 144, 250, 1)",
          pointRadius: 2.5
        }]
      },
      options: {
        animation: reducedMotion ? false : undefined,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, backdropColor: "transparent", color: "rgba(90, 113, 132, 0.9)", font: { size: 10 } },
            grid: { color: "rgba(215, 230, 244, 1)" },
            angleLines: { color: "rgba(215, 230, 244, 1)" },
            pointLabels: { color: "rgba(23, 55, 83, 1)", font: { size: 11 } }
          }
        }
      }
    });
  });
})();
`;

function chartCanvasId(index: number): string {
	return `radarChart${index}`;
}

/**
 * Serializes chart data for the `application/json` script element. `<` is
 * escaped so user-controlled strings (for example a profile name containing
 * `</script>`) cannot terminate the script context.
 */
export function chartDataJson(results: readonly EvaluationResult[]): string {
	const m = getMessages();
	const payload = results.map((result, index) => ({
		canvasId: chartCanvasId(index),
		labels: result.dimensionScores.map((score) => score.label),
		datasetLabel: m.chartDatasetLabel(result.userProfileName),
		data: result.dimensionScores.map((score) =>
			Number((score.rawScore * 100).toFixed(1)),
		),
	}));
	return JSON.stringify(payload).replaceAll("<", "\\u003c");
}

function DocumentShell(props: {
	readonly withCharts: boolean;
	readonly children: ReactNode;
}): ReactElement {
	const m = getMessages();
	return (
		<html lang={m.htmlLang}>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{m.reportTitle}</title>
				{props.withCharts ? (
					<script
						src={CHART_JS_SRC}
						integrity={CHART_JS_INTEGRITY}
						crossOrigin="anonymous"
					/>
				) : null}
				<script src={TAILWIND_SRC} />
				<style
					type="text/tailwindcss"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static stylesheet constant
					dangerouslySetInnerHTML={{ __html: THEME_CSS }}
				/>
			</head>
			<body className="bg-paper font-body text-ink antialiased">
				{props.children}
			</body>
		</html>
	);
}

function MetaChips(props: { readonly items: readonly string[] }): ReactElement {
	return (
		<dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-data text-[13px] text-subtle">
			{props.items.map((item) => (
				<dd key={item}>{item}</dd>
			))}
		</dl>
	);
}

function ReportHeader(props: {
	readonly results: readonly EvaluationResult[];
	readonly generatedAt: string;
}): ReactElement {
	const m = getMessages();
	const { results } = props;
	const taskId = results[0]?.taskId ?? "";
	const averageScore =
		results.reduce((sum, result) => sum + result.totalScore, 0) /
		results.length;
	return (
		<header className="report-card overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
			<div className="px-6 py-6 sm:px-8">
				<p className="font-data text-[11px] uppercase tracking-[0.28em] text-brand">
					swifty-eval
				</p>
				<h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
					{m.reportTitle}
				</h1>
				<MetaChips
					items={[
						`${m.generatedAtLabel}: ${props.generatedAt}`,
						`${m.taskIdLabel}: ${taskId}`,
						`${m.dialoguesCountLabel}: ${results.length}`,
						`${m.averageScoreLabel}: ${averageScore.toFixed(1)}/100`,
					]}
				/>
			</div>
			<div className="h-1 bg-brand" />
		</header>
	);
}

function GaugeRow(props: { readonly score: EvaluationScore }): ReactElement {
	const m = getMessages();
	const { score } = props;
	const rawPercent = score.rawScore * 100;
	const weighted = rawPercent * score.weight;
	const passed = score.rawScore >= PASS_THRESHOLD;
	return (
		<li className="border-t border-line py-3 first:border-t-0 first:pt-0">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-sm font-medium">{score.label}</span>
				<span className="font-data text-[13px] tabular-nums text-subtle">
					{`${rawPercent.toFixed(1)} · ${m.dimensionTableHeaders[2]} ${(score.weight * 100).toFixed(0)}% · ${m.dimensionTableHeaders[3]} ${weighted.toFixed(1)}`}
				</span>
			</div>
			<div className="relative mt-2 h-2 rounded-full bg-mist">
				<div
					className={`h-2 rounded-full ${passed ? "bg-pass" : "bg-warn"}`}
					style={{ width: `${rawPercent.toFixed(1)}%` }}
				/>
				<div
					className="absolute inset-y-[-3px] w-px bg-ink/50"
					style={{ left: `${PASS_THRESHOLD * 100}%` }}
					aria-hidden="true"
				/>
			</div>
			{score.evidence.map((evidence) => (
				<p
					key={evidence}
					className="mt-1.5 text-[13px] leading-relaxed text-subtle"
				>
					{evidence}
				</p>
			))}
		</li>
	);
}

function TurnBubble(props: { readonly turn: DialogueTurn }): ReactElement {
	const m = getMessages();
	const { turn } = props;
	const isModel = turn.role === "model";
	return (
		<li className={`flex ${isModel ? "justify-start" : "justify-end"}`}>
			<div
				className={`max-w-[85%] rounded-xl border px-4 py-2.5 ${
					isModel ? "border-brand/25 bg-brand/5" : "border-line bg-mist"
				}`}
			>
				<p
					className={`font-data text-[11px] uppercase tracking-wider ${
						isModel ? "text-brand" : "text-subtle"
					}`}
				>
					{`${m.roleLabels[turn.role]} · R${turn.roundNumber}`}
				</p>
				<p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
					{turn.content}
				</p>
				{turn.evaluationNotes !== undefined && turn.evaluationNotes !== "" ? (
					<p className="mt-1.5 inline-block rounded bg-warn/10 px-2 py-0.5 text-[12px] text-warn">
						{turn.evaluationNotes}
					</p>
				) : null}
			</div>
		</li>
	);
}

function TranscriptDetails(props: {
	readonly record: DialogueRecord;
	readonly index: number;
	readonly profileName: string;
}): ReactElement {
	const m = getMessages();
	const { record } = props;
	const rounds = record.turns.at(-1)?.roundNumber ?? 0;
	return (
		<details className="transcript border-t border-line" open>
			<summary className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-4 hover:bg-mist focus-visible:outline-2 focus-visible:outline-brand sm:px-8">
				<span className="flex items-center gap-2">
					<span className="caret font-data text-subtle" aria-hidden="true">
						▸
					</span>
					<h3 className="font-display text-base font-semibold">
						{m.dialogueHeading(props.index + 1, props.profileName)}
					</h3>
				</span>
				<span className="font-data text-[12px] text-subtle">
					{`${m.terminationReasonLabel}: ${m.terminationReasons[record.terminationReason]} · ${m.dialogueRoundsLabel}: ${rounds}`}
				</span>
			</summary>
			<ol className="space-y-3 px-6 pb-6 sm:px-8">
				{record.turns.map((turn, turnIndex) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static render of an ordered transcript
					<TurnBubble key={turnIndex} turn={turn} />
				))}
			</ol>
		</details>
	);
}

function ProfileSection(props: {
	readonly result: EvaluationResult;
	readonly index: number;
}): ReactElement {
	const m = getMessages();
	const { result, index } = props;
	const passed = result.totalScore >= PASS_THRESHOLD * 100;
	return (
		<section className="report-card mt-6 overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
			<div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[320px_1fr]">
				<div>
					<h2 className="font-display text-lg font-semibold tracking-tight">
						{m.overallScoreHeading(result.userProfileName)}
					</h2>
					<div className="mt-3 flex items-baseline gap-2">
						<span
							className={`font-display text-6xl font-bold tabular-nums tracking-tight ${passed ? "text-pass" : "text-warn"}`}
						>
							{result.totalScore.toFixed(1)}
						</span>
						<span className="font-data text-sm text-subtle">/ 100</span>
					</div>
					<p className="mt-3 font-data text-[12px] text-subtle">
						{`${m.terminationReasonLabel}: ${m.terminationReasons[result.dialogueRecord.terminationReason]}`}
					</p>
					<div className="relative mt-6 h-72">
						<canvas id={chartCanvasId(index)} />
					</div>
				</div>
				<div>
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<h3 className="font-display text-base font-semibold">
							{m.dimensionScoresHeading}
						</h3>
						<p className="font-data text-[11px] text-subtle">
							<span
								className="mr-1.5 inline-block h-3 w-px bg-ink/50 align-[-2px]"
								aria-hidden="true"
							/>
							{m.thresholdLegend}
						</p>
					</div>
					<ol className="mt-4">
						{result.dimensionScores.map((score) => (
							<GaugeRow key={score.dimensionKey} score={score} />
						))}
					</ol>
				</div>
			</div>
			<TranscriptDetails
				record={result.dialogueRecord}
				index={index}
				profileName={result.userProfileName}
			/>
		</section>
	);
}

function Recommendations(props: {
	readonly results: readonly EvaluationResult[];
}): ReactElement | null {
	const m = getMessages();
	const unique = new Set<string>();
	for (const result of props.results) {
		for (const recommendation of result.recommendations) {
			unique.add(recommendation);
		}
	}
	if (unique.size === 0) {
		return null;
	}
	return (
		<section className="report-card mt-6 rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
			<h3 className="font-display text-base font-semibold">
				{m.recommendationsSection}
			</h3>
			<ul className="mt-3 space-y-2">
				{[...unique].sort().map((recommendation) => (
					<li
						key={recommendation}
						className="flex gap-3 text-sm leading-relaxed"
					>
						<span
							className="select-none font-data text-warn"
							aria-hidden="true"
						>
							→
						</span>
						{recommendation}
					</li>
				))}
			</ul>
		</section>
	);
}

function ReportDocument(props: {
	readonly results: readonly EvaluationResult[];
	readonly generatedAt: string;
}): ReactElement {
	return (
		<DocumentShell withCharts={true}>
			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<ReportHeader results={props.results} generatedAt={props.generatedAt} />
				{props.results.map((result, index) => (
					<ProfileSection
						key={result.userProfileName}
						result={result}
						index={index}
					/>
				))}
				<Recommendations results={props.results} />
			</div>
			<script
				type="application/json"
				id={CHART_DATA_ID}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON payload with `<` escaped in chartDataJson
				dangerouslySetInnerHTML={{ __html: chartDataJson(props.results) }}
			/>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static bootstrap constant without interpolated data
				dangerouslySetInnerHTML={{ __html: CHART_BOOTSTRAP }}
			/>
		</DocumentShell>
	);
}

function EmptyDocument(): ReactElement {
	const m = getMessages();
	return (
		<DocumentShell withCharts={false}>
			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<div className="report-card rounded-2xl border border-line bg-card px-6 py-16 text-center shadow-sm">
					<p className="font-data text-[11px] uppercase tracking-[0.28em] text-subtle">
						swifty-eval
					</p>
					<h1 className="mt-3 font-display text-xl font-semibold">
						{m.noData}
					</h1>
				</div>
			</div>
		</DocumentShell>
	);
}

/** Renders the full HTML report for one or more evaluated profiles. */
export function renderHtmlReport(
	results: readonly EvaluationResult[],
	generatedAt: Date,
): string {
	return `<!DOCTYPE html>\n${renderToStaticMarkup(
		<ReportDocument
			results={results}
			generatedAt={formatDateTime(generatedAt)}
		/>,
	)}`;
}

/** Renders the placeholder page shown when there are no results. */
export function renderEmptyHtmlReport(): string {
	return `<!DOCTYPE html>\n${renderToStaticMarkup(<EmptyDocument />)}`;
}
