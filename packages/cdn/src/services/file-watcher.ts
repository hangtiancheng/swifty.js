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

import { watch, type FSWatcher } from "chokidar";
import { Cache } from "@swifty.js/cache";
import { getProjectConfig, getConfigMap, invalidateVersionCache } from "./config-store.js";
import type { PrefixIndex } from "./cache-utils.js";
import { logger } from "../utils/logger.js";

const watchers = new Map<string, FSWatcher>();

export function startFileWatcher(cache: Cache, prefixIndex: PrefixIndex): void {
  const configMap = getConfigMap();

  for (const [, project] of configMap) {
    for (const version of project.versions) {
      if (!version.isActive) continue;
      watchDistPath(cache, prefixIndex, project.name, version.version, version.distPath);
    }
  }
}

function watchDistPath(
  cache: Cache,
  prefixIndex: PrefixIndex,
  projectName: string,
  version: string,
  distPath: string,
): void {
  const key = `${projectName}@${version}`;
  if (watchers.has(key)) return;

  const watcher = watch(distPath, {
    ignoreInitial: true,
    ignored: /(^|[/\\])\../,
    persistent: true,
  });

  const onFileChange = (filePath: string): void => {
    const relativePath = filePath.slice(distPath.length).replace(/^\//, "");
    invalidateVersionCache(cache, prefixIndex, projectName, version);
    logger.debug(
      { project: projectName, version, file: relativePath },
      "Cache invalidated on file change",
    );
  };

  watcher.on("change", onFileChange);
  watcher.on("add", onFileChange);
  watcher.on("unlink", onFileChange);

  watchers.set(key, watcher);
  logger.info({ project: projectName, version, distPath }, "Watching dist");
}

export async function stopFileWatcher(): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const [, watcher] of watchers) {
    promises.push(watcher.close());
  }
  await Promise.all(promises);
  watchers.clear();
}

export function addWatch(
  cache: Cache,
  prefixIndex: PrefixIndex,
  projectName: string,
  version: string,
): void {
  const project = getProjectConfig(projectName);
  if (project === undefined) return;

  const versionConfig = project.versions.find((v) => v.version === version);
  if (versionConfig === undefined || !versionConfig.isActive) return;

  watchDistPath(cache, prefixIndex, projectName, version, versionConfig.distPath);
}

export async function removeWatch(projectName: string, version: string): Promise<void> {
  const key = `${projectName}@${version}`;
  const watcher = watchers.get(key);
  if (watcher !== undefined) {
    await watcher.close();
    watchers.delete(key);
  }
}
