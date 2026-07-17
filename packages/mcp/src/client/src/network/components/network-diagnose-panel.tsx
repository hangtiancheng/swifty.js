/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useMemo } from "@swifty.js/preact/hooks";
import { useTranslation } from "react-i18next";
import {
  Activity,
  X,
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  Send,
  Wrench,
  Bug,
} from "lucide-react";
import NetworkDiagnoseSDK from "../sdk/network-diagnose-sdk.js";
import type {
  DiagnosticResult,
  SDKOptions,
  ApiCheckResult,
  ResourceCheckResult,
  LocationInfo,
  SpeedTestResult,
  Lang,
  NetworkInfo,
} from "../sdk/types.js";
import { DiagnosticTaskId } from "../sdk/types.js";
import type { FunctionComponent } from "@swifty.js/preact";

interface NetworkDiagnosePanelProps {
  config: Omit<SDKOptions, "onResultsUpdate">;
  title?: string;
  onCallAction?: (results: DiagnosticResult[]) => void;
}

const NetworkDiagnosePanel: FunctionComponent<NetworkDiagnosePanelProps> = ({
  config,
  title = "Network Diagnostics",
  onCallAction: onCallAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId] = useState(() => Date.now().toString().slice(-6));
  const { t, i18n } = useTranslation();
  const [showToast, setShowToast] = useState(false);

  const sdk = useMemo(
    () =>
      new NetworkDiagnoseSDK({
        ...config,
        lang: (i18n.language === "zh" ? "zh" : "en") as Lang,
        onResultsUpdate: (newResults: DiagnosticResult[]) => {
          setResults(newResults);
        },
      }),
    [config, i18n.language],
  );

  const startDiagnosis = async () => {
    setIsRunning(true);
    await sdk.runFullDiagnosis();
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-[#6bc4a6]" />;
      case "failure":
        return <XCircle className="h-5 w-5 text-[#e88a8a]" />;
      case "running":
        return (
          <span className="loading loading-spinner loading-sm text-[#5ba3e6]" />
        );
      case "skipped":
        return <SkipForward className="h-5 w-5 text-[#8dabc4]/40" />;
      default:
        return <Clock className="h-5 w-5 text-[#8dabc4]/30" />;
    }
  };

  const renderDetails = (result: DiagnosticResult) => {
    if (!result.details) return null;

    if (result.id === DiagnosticTaskId.NetworkStatus) {
      const info = result.details as NetworkInfo & { online: boolean };
      return (
        <div className="mt-2 space-y-1.5 pl-8 text-sm text-[#5a7fa3]/70">
          <p className="flex items-center gap-2">
            <span className="text-[#5a7fa3]/50">{t("ui.online")}:</span>
            {info.online ? (
              <span className="badge badge-sm border-[#6bc4a6]/20 bg-[#f0fdf7] text-[#2d7a5a]">
                {t("ui.yes")}
              </span>
            ) : (
              <span className="badge badge-sm border-[#e88a8a]/20 bg-[#fef2f2] text-[#b44040]">
                {t("ui.no")}
              </span>
            )}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-[#5a7fa3]/50">{t("ui.network_type")}:</span>
            {info.effectiveType ? (
              <span className="badge badge-outline badge-sm border-[#dceaf8] text-[#5a7fa3]">
                {info.effectiveType}
              </span>
            ) : (
              ""
            )}
          </p>
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.downlink")}:</span>{" "}
            {info.downlink !== undefined
              ? `${info.downlink} Mbps`
              : t("ui.unknown")}
          </p>
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.rtt")}:</span>{" "}
            {info.rtt !== undefined ? `${info.rtt} ms` : t("ui.unknown")}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-[#5a7fa3]/50">{t("ui.data_saver")}:</span>
            {info.saveData !== undefined ? (
              info.saveData ? (
                <span className="badge badge-sm border-[#e6b980]/20 bg-[#fef9f0] text-[#9a6b2e]">
                  {t("ui.on")}
                </span>
              ) : (
                <span className="badge badge-sm border-[#dceaf8] bg-[#f8fbff] text-[#8dabc4]">
                  {t("ui.off")}
                </span>
              )
            ) : (
              t("ui.unknown")
            )}
          </p>
        </div>
      );
    }

    if (result.id === DiagnosticTaskId.LocationCheck) {
      const info = result.details as LocationInfo;
      return (
        <div className="mt-2 space-y-1 pl-8 text-sm text-[#5a7fa3]/70">
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.ip")}:</span> {info.ip}
          </p>
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.location")}:</span>{" "}
            {info.city}, {info.region}, {info.country}
          </p>
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.isp")}:</span> {info.isp}
          </p>
        </div>
      );
    }

    if (result.id === DiagnosticTaskId.SpeedTest) {
      const info = result.details as SpeedTestResult;
      return (
        <div className="mt-2 space-y-1 pl-8 text-sm text-[#5a7fa3]/70">
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.download_speed")}:</span>{" "}
            <span className="font-semibold text-[#5ba3e6]">
              {info.downloadSpeedMbps}
            </span>{" "}
            Mbps
          </p>
          <p>
            <span className="text-[#5a7fa3]/50">{t("ui.latency")}:</span>{" "}
            {info.latencyMs} ms
          </p>
        </div>
      );
    }

    if (result.id === DiagnosticTaskId.ApiCheck) {
      const list = result.details as ApiCheckResult[];
      return (
        <div className="mt-2 pl-8 text-sm">
          <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl bg-[#f0f7ff]/50 p-2">
            {list.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-white/70 p-2"
              >
                <span
                  className="max-w-[60%] truncate font-mono text-xs text-[#5a7fa3]/70"
                  title={item.url}
                >
                  {item.url}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge badge-sm ${
                      item.ok
                        ? "border-[#6bc4a6]/20 bg-[#f0fdf7] text-[#2d7a5a]"
                        : "border-[#e88a8a]/20 bg-[#fef2f2] text-[#b44040]"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-[#8dabc4]/50">
                    {item.timeMs}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (result.id === DiagnosticTaskId.ResourceCheck) {
      const list = result.details as ResourceCheckResult[];
      return (
        <div className="mt-2 pl-8 text-sm">
          <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl bg-[#f0f7ff]/50 p-2">
            {list.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-white/70 p-2"
              >
                <span
                  className="max-w-[60%] truncate font-mono text-xs text-[#5a7fa3]/70"
                  title={item.url}
                >
                  {item.url}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge badge-sm ${
                      item.loaded
                        ? "border-[#6bc4a6]/20 bg-[#f0fdf7] text-[#2d7a5a]"
                        : "border-[#e88a8a]/20 bg-[#fef2f2] text-[#b44040]"
                    }`}
                  >
                    {item.loaded ? t("ui.ok") : t("ui.fail")}
                  </span>
                  <span className="text-xs text-[#8dabc4]/50">
                    {item.timeMs}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="pl-6 text-xs text-[#8dabc4]/50">
        {JSON.stringify(result.details)}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-circle btn-lg fixed right-6 bottom-6 z-50 border-none bg-linear-to-br from-[#5ba3e6] to-[#7cb8ec] text-white shadow-[0_4px_24px_rgba(91,163,230,0.3)] hover:shadow-[0_6px_32px_rgba(91,163,230,0.4)] hover:brightness-105"
        title={t("ui.title")}
      >
        <Activity className="h-7 w-7" />
      </button>
    );
  }

  const hasFailures = results.some((r) => r.status === "failure");

  return (
    <div className="fixed right-6 bottom-6 z-50 flex max-h-[85vh] w-100 flex-col overflow-hidden rounded-2xl border border-[#cde4fb]/40 bg-white/80 shadow-[0_8px_48px_rgba(91,163,230,0.12)] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e1effe]/50 bg-[#f0f7ff]/40 p-4">
        <h3 className="flex items-center gap-2.5 text-sm font-semibold text-[#2e4a6e]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5ba3e6]/10">
            <Activity className="h-4 w-4 text-[#5ba3e6]" />
          </div>
          {title || t("ui.title")}
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-ghost btn-sm btn-circle text-[#8dabc4]/50 hover:bg-[#5ba3e6]/8 hover:text-[#5a7fa3]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {results.length === 0 && !isRunning ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5ba3e6]/6">
              <Activity className="h-8 w-8 text-[#5ba3e6]/20" />
            </div>
            <p className="text-center text-sm text-[#5a7fa3]/40">
              {t("ui.start_msg")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="rounded-xl border border-[#e1effe]/50 bg-[#f8fbff]/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-[#2e4a6e]">
                    {getStatusIcon(result.status)} {result.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {result.repair && result.status === "failure" && (
                      <button
                        onClick={() => result.repair?.()}
                        disabled={result.repairStatus === "repairing"}
                        className="btn btn-xs rounded-full border-[#5ba3e6]/20 bg-transparent px-3 text-[#5ba3e6] hover:border-[#5ba3e6]/30 hover:bg-[#5ba3e6]/8"
                      >
                        {result.repairStatus === "repairing" ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Wrench className="h-3 w-3" />
                        )}
                        {result.repairStatus === "repairing"
                          ? t("ui.repairing_btn")
                          : t("ui.repair_btn")}
                      </button>
                    )}
                    {result.duration !== undefined && (
                      <span className="badge badge-sm gap-1 border-[#dceaf8] bg-[#f0f7ff] font-mono text-[10px] text-[#8dabc4]">
                        <Clock className="h-3 w-3" /> {result.duration}ms
                      </span>
                    )}
                  </div>
                </div>
                {result.message && (
                  <div className="mb-2 pl-8 text-sm text-[#5a7fa3]/60">
                    {result.message}
                  </div>
                )}
                {renderDetails(result)}
                {result.recommendation && (
                  <div className="mt-3 ml-8 flex items-start gap-2 rounded-lg border border-[#e6b980]/15 bg-[#fef9f0]/50 p-3 text-sm text-[#9a6b2e]">
                    <Send className="h-4 w-4 shrink-0 text-[#e6b980]" />
                    <span>
                      <span className="font-medium">
                        {t("ui.recommendation")}
                      </span>
                      : {result.recommendation}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-3 border-t border-[#e1effe]/50 bg-[#f0f7ff]/30 p-4">
        <button
          onClick={startDiagnosis}
          disabled={isRunning}
          className="btn w-full rounded-full border-none bg-linear-to-r from-[#5ba3e6] to-[#7cb8ec] font-medium text-white shadow-[0_2px_12px_rgba(91,163,230,0.2)] hover:shadow-[0_4px_20px_rgba(91,163,230,0.3)] hover:brightness-105"
        >
          {isRunning && <span className="loading loading-spinner"></span>}
          {isRunning ? t("ui.diagnosing_btn") : t("ui.start_btn")}
        </button>

        {hasFailures && (
          <button
            onClick={() => {
              if (onCallAction) {
                onCallAction(results);
              } else {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
              }
            }}
            className="btn btn-outline w-full rounded-full border-[#e88a8a]/30 bg-transparent text-[#c96060] hover:border-[#e88a8a]/50 hover:bg-[#fef2f2]/50"
          >
            <Bug className="h-4 w-4" /> {t("ui.on_call_btn")}
          </button>
        )}

        <div className="mt-2 text-center font-mono text-[10px] tracking-wider text-[#8dabc4]/35">
          {t("ui.diag_id")}: {sessionId}
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="toast toast-center toast-top absolute z-100">
          <div className="alert border-[#e6b980]/20 bg-[#fef9f0] text-[#9a6b2e] shadow-lg">
            <span className="flex items-center gap-2 text-sm">
              <Send className="h-4 w-4" />
              OnCall function not configured
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkDiagnosePanel;
