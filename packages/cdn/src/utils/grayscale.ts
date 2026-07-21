/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Grayscale version resolver.
 * Implements the 3-level priority strategy:
 *   1. URL explicit version (highest)
 *   2. Header / Cookie override
 *   3. Weighted random (default)
 */
import type {
  ProjectConfig,
  VersionConfig,
  ResolvedVersion,
  VersionResolutionSource,
} from "../types/index.js";

// ============================================================
// Weighted random selection
// ============================================================

/**
 * Select a version by weighted random from active versions.
 * @returns The selected version, or the first active version as fallback
 */
export function getVersionByWeight(versions: readonly VersionConfig[]): VersionConfig | undefined {
  const activeVersions = versions.filter((v) => v.isActive);
  if (activeVersions.length === 0) return undefined;
  if (activeVersions.length === 1) return activeVersions[0];

  const totalWeight = activeVersions.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight === 0) return activeVersions[0];

  let random = Math.random() * totalWeight;
  for (const v of activeVersions) {
    random -= v.weight;
    if (random <= 0) return v;
  }
  return activeVersions[activeVersions.length - 1];
}

// ============================================================
// Find version by identifier
// ============================================================

/**
 * Find a version config by its version string within a project.
 */
function findVersion(project: ProjectConfig, versionId: string): VersionConfig | undefined {
  return project.versions.find((v) => v.version === versionId);
}

// ============================================================
// Header / Cookie parsing
// ============================================================

/**
 * Extract version from request headers.
 * Header supports two formats:
 *   - plain string: applies to all projects
 *   - JSON object: per-project mapping, e.g. {"projectA": "1.0", "projectB": "2.0"}
 * Falls back to the per-project cookie when the header yields nothing.
 */
function getVersionFromHeaders(
  headers: Readonly<Record<string, string | undefined>>,
  projectName: string,
  headerName: string,
  cookiePrefix: string,
): { version: string; source: "header-override" | "cookie-override" } | undefined {
  const headerValue = headers[headerName.toLowerCase()];
  if (typeof headerValue === "string" && headerValue.length > 0) {
    if (headerValue.startsWith("{")) {
      try {
        const parsed = JSON.parse(headerValue) as Record<string, unknown>;
        const ver = parsed[projectName];
        if (typeof ver === "string" && ver.length > 0) {
          return { version: ver, source: "header-override" };
        }
      } catch {
        // invalid JSON, treat as plain string
        return { version: headerValue, source: "header-override" };
      }
    } else {
      return { version: headerValue, source: "header-override" };
    }
  }

  // Check cookie
  const cookieHeader = headers["cookie"];
  if (typeof cookieHeader !== "string") return undefined;

  const cookieName = `${cookiePrefix}${projectName}`;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${cookieName}=`)) {
      const value = trimmed.slice(cookieName.length + 1);
      if (value.length > 0) return { version: value, source: "cookie-override" };
    }
  }

  return undefined;
}

// ============================================================
// Main resolver
// ============================================================

/**
 * Resolve which version to serve based on the 3-level grayscale strategy.
 *
 * Priority:
 *   1. URL explicit (e.g., /project@2.0.0/file.js)
 *   2. Header/Cookie override (X-CDN-Version or cdn_version_<project>)
 *   3. Weighted random (default)
 *   4. Project defaultVersion fallback
 */
export function resolveVersion(
  project: ProjectConfig,
  explicitVersion: string | undefined,
  headers: Readonly<Record<string, string | undefined>>,
  headerName: string,
  cookiePrefix: string,
): ResolvedVersion | undefined {
  // Level 1: URL explicit version
  if (explicitVersion !== undefined) {
    const version = findVersion(project, explicitVersion);
    if (version !== undefined) {
      return {
        config: version,
        source: "url-explicit" as VersionResolutionSource,
      };
    }
  }

  // Level 2: Header/Cookie override
  const override = getVersionFromHeaders(headers, project.name, headerName, cookiePrefix);
  if (override !== undefined) {
    const version = findVersion(project, override.version);
    if (version !== undefined) {
      return {
        config: version,
        source: override.source,
      };
    }
  }

  // Level 3: Weighted random
  const weighted = getVersionByWeight(project.versions);
  if (weighted !== undefined) {
    return {
      config: weighted,
      source: "weighted-random" as VersionResolutionSource,
    };
  }

  // Level 4: Default fallback
  const defaultVersion = findVersion(project, project.defaultVersion);
  if (defaultVersion !== undefined) {
    return {
      config: defaultVersion,
      source: "default-fallback" as VersionResolutionSource,
    };
  }

  return undefined;
}
