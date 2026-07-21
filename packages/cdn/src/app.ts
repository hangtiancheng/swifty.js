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

import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import cors from "@koa/cors";
import { Cache } from "@swifty.js/cache";
import type { ServerConfig } from "./types/index.js";
import { PrefixIndex } from "./services/cache-utils.js";
import { errorMiddleware } from "./middleware/error.js";
import { createCdnMiddleware } from "./middleware/cdn.js";
import { createApiRouter } from "./routes/api.js";

export interface AppInstance {
  app: Koa;
  cache: Cache;
  prefixIndex: PrefixIndex;
}

export function createApp(config: ServerConfig): AppInstance {
  const app = new Koa();
  const prefixIndex = new PrefixIndex();
  const cache = new Cache({
    maxBytes: config.cacheMaxSize,
    onEvicted: (key) => prefixIndex.remove(key),
  });

  app.use(errorMiddleware);
  app.use(
    cors({
      origin: "*",
      exposeHeaders: ["ETag", "X-Cache", "X-CDN-Version", "X-Resolution-Source"],
    }),
  );
  app.use(bodyParser());

  const apiRouter = createApiRouter(cache, prefixIndex, config);
  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  app.use(createCdnMiddleware(cache, prefixIndex, config));

  return { app, cache, prefixIndex };
}
