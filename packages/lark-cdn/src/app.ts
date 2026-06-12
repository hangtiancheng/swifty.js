import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import cors from "@koa/cors";
import type { ServerConfig } from "./types/index.js";
import { LruCache } from "./services/memory-cache.js";
import { errorMiddleware } from "./middleware/error.js";
import { createCdnMiddleware } from "./middleware/cdn.js";
import { createApiRouter } from "./routes/api.js";

export interface AppInstance {
  app: Koa;
  cache: LruCache;
}

export function createApp(config: ServerConfig): AppInstance {
  const app = new Koa();
  const cache = new LruCache(config.cacheMaxSize);

  app.use(errorMiddleware);
  app.use(cors({ origin: "*" }));
  app.use(bodyParser());

  const apiRouter = createApiRouter(cache, config);
  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  app.use(createCdnMiddleware(cache, config));

  return { app, cache };
}
