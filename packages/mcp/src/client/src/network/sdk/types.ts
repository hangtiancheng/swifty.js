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

declare global {
  interface Navigator {
    connection?: NetworkInfo & EventTarget;
  }
}

export type Lang = "en" | "zh";

export enum DiagnosticTaskId {
  NetworkStatus = "network-status",
  LocationCheck = "location-check",
  SpeedTest = "speed-test",
  ApiCheck = "api-check",
  ResourceCheck = "resource-check",
}

export interface DiagnosticResult {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failure" | "skipped";
  message?: string;
  details?: unknown;
  error?: string;
  duration?: number;
  recommendation?: string;
  repairStatus?: "idle" | "repairing" | "success" | "failure";
  repair?: () => Promise<boolean>;
}

export interface NetworkInfo {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export interface SpeedTestResult {
  downloadSpeedMbps: number;
  latencyMs?: number;
}

export interface ApiCheckResult {
  url: string;
  status: number;
  ok: boolean;
  timeMs: number;
}

export interface ResourceCheckResult {
  url: string;
  loaded: boolean;
  timeMs: number;
}

export interface LocationInfo {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
}

export type DiagnosticCallback = (results: DiagnosticResult[]) => void;

export interface CustomTask {
  id: string;
  name: string;
  run: (ctx: SDKOptions) => Promise<unknown>;
  repair?: (ctx: SDKOptions) => Promise<boolean>;
}

export interface SDKOptions {
  lang?: Lang;
  apiList?: string[];
  resourceList?: string[];
  speedTestFileUrl?: string;
  customTasks?: CustomTask[];
  onResultsUpdate?: DiagnosticCallback;
  updateResult?: (id: string, updates: Partial<DiagnosticResult>) => void;
}
