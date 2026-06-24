import path from "node:path";
import { Project, toProjectConfig } from "../models/project.js";
import type { ConfigMap, ProjectConfig } from "../types/index.js";
import type { LruCache } from "./memory-cache.js";

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

export function invalidateProjectCache(cache: LruCache, projectName: string): void {
  cache.deleteByPrefix(`${projectName}@`);
}

export function invalidateVersionCache(
  cache: LruCache,
  projectName: string,
  version: string,
): void {
  cache.deleteByPrefix(`${projectName}@${version}:`);
}

export function validateDistPath(distPath: string, workspaceRoot: string): boolean {
  const resolved = path.resolve(distPath);
  const normalizedRoot = path.resolve(workspaceRoot);
  return resolved.startsWith(normalizedRoot + path.sep) || resolved === normalizedRoot;
}
