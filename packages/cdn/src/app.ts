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
  app.use(cors({ origin: "*" }));
  app.use(bodyParser());

  const apiRouter = createApiRouter(cache, prefixIndex, config);
  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  app.use(createCdnMiddleware(cache, prefixIndex, config));

  return { app, cache, prefixIndex };
}
