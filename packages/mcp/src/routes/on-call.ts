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
import { type AppContext } from "../app.js";

export const setupOnCallRoutes = () => {
  const router = new Router<unknown, AppContext>({ prefix: "/onCall" });

  router.post("/", async (ctx) => {
    console.error(
      "[OnCall] Diagnostic Report:",
      JSON.stringify(ctx.request.body, null, 2),
    );
    ctx.status = 200;
    ctx.body = { ok: true };
  });

  return router;
};
