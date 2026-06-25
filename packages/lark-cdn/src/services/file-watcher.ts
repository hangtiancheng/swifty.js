import { watch, type FSWatcher } from "chokidar";
import { Cache } from "@lark.js/cache";
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
