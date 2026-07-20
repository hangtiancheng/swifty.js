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

import Router from "@koa/router";
import type { Context } from "koa";
import { Cache } from "@swifty.js/cache";
import { Project, toProjectConfig } from "../models/project.js";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
  VersionCreateSchema,
  VersionUpdateSchema,
  PublishSchema,
} from "../types/schemas.js";
import {
  refreshProjectConfig,
  invalidateProjectCache,
  validateDistPath,
} from "../services/config-store.js";
import { discoverDists } from "../services/discover.js";
import { addWatch, removeWatch } from "../services/file-watcher.js";
import type { PrefixIndex } from "../services/cache-utils.js";
import type { ServerConfig } from "../types/index.js";

function success(ctx: Context, data: unknown, status = 200): void {
  ctx.status = status;
  ctx.body = { success: true, data };
}

function fail(ctx: Context, message: string, status = 400): void {
  ctx.status = status;
  ctx.body = { success: false, error: "ValidationError", message };
}

function notFound(ctx: Context, message: string): void {
  ctx.status = 404;
  ctx.body = { success: false, error: "NotFound", message };
}

export function createApiRouter(
  cache: Cache,
  prefixIndex: PrefixIndex,
  config: ServerConfig,
): Router {
  const router = new Router({ prefix: config.apiPrefix });

  // ==========================================================
  // Health & Stats
  // ==========================================================

  router.get("/health", (ctx: Context): void => {
    success(ctx, { status: "ok", uptime: process.uptime() });
  });

  router.get("/cache/stats", (ctx: Context): void => {
    const stats = cache.stats();
    success(ctx, {
      entries: cache.len(),
      maxSizeBytes: config.cacheMaxSize,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hit_rate,
    });
  });

  // ==========================================================
  // Project CRUD
  // ==========================================================

  router.get("/projects", async (ctx: Context): Promise<void> => {
    const projects = await Project.find().lean();
    success(ctx, projects.map(toProjectConfig));
  });

  router.get("/projects/:name", async (ctx: Context): Promise<void> => {
    const { name } = ctx.params;
    const project = await Project.findOne({ name }).lean();
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }
    success(ctx, toProjectConfig(project));
  });

  router.post("/projects", async (ctx: Context): Promise<void> => {
    const parsed = ProjectCreateSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      fail(ctx, parsed.error.message);
      return;
    }

    for (const v of parsed.data.versions) {
      if (!validateDistPath(v.distPath, config.workspaceRoot)) {
        fail(ctx, `distPath "${v.distPath}" is outside workspace root`);
        return;
      }
    }

    const existing = await Project.findOne({ name: parsed.data.name });
    if (existing !== null) {
      fail(ctx, `Project "${parsed.data.name}" already exists`, 409);
      return;
    }

    const project = await Project.create(parsed.data);
    await refreshProjectConfig(parsed.data.name);

    for (const v of parsed.data.versions) {
      addWatch(cache, prefixIndex, parsed.data.name, v.version);
    }

    success(ctx, toProjectConfig(project.toObject()), 201);
  });

  router.put("/projects/:name", async (ctx: Context): Promise<void> => {
    const { name } = ctx.params;
    const parsed = ProjectUpdateSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      fail(ctx, parsed.error.message);
      return;
    }

    const project = await Project.findOneAndUpdate({ name }, parsed.data, {
      new: true,
    }).lean();
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }

    invalidateProjectCache(cache, prefixIndex, name);
    await refreshProjectConfig(name);
    success(ctx, toProjectConfig(project));
  });

  router.delete("/projects/:name", async (ctx: Context): Promise<void> => {
    const { name } = ctx.params;

    const project = await Project.findOne({ name }).lean();
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }

    for (const v of project.versions) {
      await removeWatch(name, v.version);
    }

    await Project.deleteOne({ name });
    invalidateProjectCache(cache, prefixIndex, name);
    await refreshProjectConfig(name);
    success(ctx, { deleted: true });
  });

  // ==========================================================
  // Version CRUD
  // ==========================================================

  router.get("/projects/:name/versions", async (ctx: Context): Promise<void> => {
    const { name } = ctx.params;
    const project = await Project.findOne({ name }).lean();
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }
    success(ctx, project.versions);
  });

  router.post("/projects/:name/versions", async (ctx: Context): Promise<void> => {
    const { name } = ctx.params;
    const parsed = VersionCreateSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      fail(ctx, parsed.error.message);
      return;
    }

    if (!validateDistPath(parsed.data.distPath, config.workspaceRoot)) {
      fail(ctx, `distPath "${parsed.data.distPath}" is outside workspace root`);
      return;
    }

    const project = await Project.findOne({ name });
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }

    project.versions.push(parsed.data);
    await project.save();

    invalidateProjectCache(cache, prefixIndex, name);
    await refreshProjectConfig(name);
    addWatch(cache, prefixIndex, name, parsed.data.version);
    success(ctx, toProjectConfig(project.toObject()), 201);
  });

  router.put("/projects/:name/versions/:version", async (ctx: Context): Promise<void> => {
    const { name, version } = ctx.params;
    const parsed = VersionUpdateSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      fail(ctx, parsed.error.message);
      return;
    }

    if (
      parsed.data.distPath !== undefined &&
      !validateDistPath(parsed.data.distPath, config.workspaceRoot)
    ) {
      fail(ctx, `distPath "${parsed.data.distPath}" is outside workspace root`);
      return;
    }

    const project = await Project.findOne({ name });
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }

    const versionDoc = project.versions.find((v) => v.version === version);
    if (versionDoc === undefined) {
      notFound(ctx, `Version "${version}" not found in project "${name}"`);
      return;
    }

    const update = parsed.data;
    if (update.version !== undefined) versionDoc.version = update.version;
    if (update.distPath !== undefined) versionDoc.distPath = update.distPath;
    if (update.weight !== undefined) versionDoc.weight = update.weight;
    if (update.isActive !== undefined) versionDoc.isActive = update.isActive;

    await project.save();

    await removeWatch(name, version);
    invalidateProjectCache(cache, prefixIndex, name);
    await refreshProjectConfig(name);
    addWatch(cache, prefixIndex, name, update.version ?? version);
    success(ctx, toProjectConfig(project.toObject()));
  });

  router.delete("/projects/:name/versions/:version", async (ctx: Context): Promise<void> => {
    const { name, version } = ctx.params;

    const project = await Project.findOne({ name });
    if (project === null) {
      notFound(ctx, `Project "${name}" not found`);
      return;
    }

    const index = project.versions.findIndex((v) => v.version === version);
    if (index === -1) {
      notFound(ctx, `Version "${version}" not found in project "${name}"`);
      return;
    }

    project.versions.splice(index, 1);
    await project.save();

    await removeWatch(name, version);
    invalidateProjectCache(cache, prefixIndex, name);
    await refreshProjectConfig(name);
    success(ctx, toProjectConfig(project.toObject()));
  });

  // ==========================================================
  // Discovery & Publish
  // ==========================================================

  router.get("/discover", async (ctx: Context): Promise<void> => {
    const dists = await discoverDists(config.workspaceRoot);
    success(ctx, dists);
  });

  router.post("/publish", async (ctx: Context): Promise<void> => {
    const parsed = PublishSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      fail(ctx, parsed.error.message);
      return;
    }

    const { name, version, distPath } = parsed.data;

    if (!validateDistPath(distPath, config.workspaceRoot)) {
      fail(ctx, `distPath "${distPath}" is outside workspace root`);
      return;
    }

    let project = await Project.findOne({ name });
    if (project === null) {
      project = await Project.create({
        name,
        description: "",
        defaultVersion: version,
        versions: [{ version, distPath, weight: 100, isActive: true }],
      });
    } else {
      const existingVersion = project.versions.find((v) => v.version === version);
      if (existingVersion !== undefined) {
        existingVersion.distPath = distPath;
        existingVersion.isActive = true;
      } else {
        project.versions.push({
          version,
          distPath,
          weight: 100,
          isActive: true,
        });
      }
      await project.save();
    }

    invalidateProjectCache(cache, prefixIndex, name);
    await refreshProjectConfig(name);
    addWatch(cache, prefixIndex, name, version);
    success(ctx, toProjectConfig(project.toObject()), 201);
  });

  return router;
}
