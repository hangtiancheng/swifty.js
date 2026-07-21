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

import path from "node:path";
import { Cache } from "@swifty.js/cache";
import { Project, toProjectConfig } from "../models/project.js";
import type { ConfigMap, ProjectConfig } from "../types/index.js";
import type { PrefixIndex } from "./cache-utils.js";

let configMap: ConfigMap = new Map();

export function getConfigMap(): ConfigMap {
  return configMap;
}

export function getProjectConfig(name: string): ProjectConfig | undefined {
  return configMap.get(name);
}

export async function refreshConfig(): Promise<void> {
  const projects = await Project.find().lean();
  const newMap = new Map<string, ProjectConfig>();
  for (const doc of projects) {
    newMap.set(doc.name, toProjectConfig(doc));
  }
  configMap = newMap;
}

export async function refreshProjectConfig(name: string): Promise<void> {
  const doc = await Project.findOne({ name }).lean();
  const mutable = new Map(configMap);
  if (doc === null) {
    mutable.delete(name);
  } else {
    mutable.set(name, toProjectConfig(doc));
  }
  configMap = mutable;
}

export function invalidateProjectCache(
  cache: Cache,
  index: PrefixIndex,
  projectName: string,
): void {
  const keys = index.getKeysWithPrefix(`${projectName}@`);
  for (const key of keys) cache.delete(key);
  index.deletePrefix(`${projectName}@`);
}

export function invalidateVersionCache(
  cache: Cache,
  index: PrefixIndex,
  projectName: string,
  version: string,
): void {
  const prefix = `${projectName}@${version}:`;
  const keys = index.getKeysWithPrefix(prefix);
  for (const key of keys) cache.delete(key);
  index.deletePrefix(prefix);
}

export function validateDistPath(
  distPath: string,
  workspaceRoot: string,
): boolean {
  const resolved = path.resolve(distPath);
  const normalizedRoot = path.resolve(workspaceRoot);
  return (
    resolved.startsWith(normalizedRoot + path.sep) ||
    resolved === normalizedRoot
  );
}
