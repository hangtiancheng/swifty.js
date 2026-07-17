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

import Koa from "koa";
import serve from "koa-static";
import { MongoClient, Db } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import { setupPromptRoutes } from "./routes/prompt.js";
import { setupMcpRoutes } from "./mcp.js";
import { setupOnCallRoutes } from "./routes/on-call.js";
import bodyParser from "@koa/bodyparser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppContext extends Koa.Context {
  db: Db;
}
export interface AppInstance extends Koa<Koa.DefaultState, AppContext> {
  mongoClient: MongoClient;
}

export const buildApp = async (): Promise<AppInstance> => {
  const app = new Koa<Koa.DefaultState, AppContext>() as AppInstance;

  // Setup MongoDB
  const defaultMongoUrl =
    "mongodb://root:pass@localhost:27017/db0?authSource=admin";
  const client = new MongoClient(process.env.MONGO_URL || defaultMongoUrl);
  await client.connect();
  const db = client.db();

  // Inject db into context
  app.context.db = db;

  // Middleware
  app.use(bodyParser());

  // Serve static files from client folder
  app.use(serve(path.join(__dirname, process.env.CLIENT_PATH || "./client")));

  // Setup Routes
  const promptRouter = setupPromptRoutes();
  const mcpRouter = setupMcpRoutes();

  app.use(promptRouter.routes()).use(promptRouter.allowedMethods());
  app.use(mcpRouter.routes()).use(mcpRouter.allowedMethods());

  const onCallRouter = setupOnCallRoutes();
  app.use(onCallRouter.routes()).use(onCallRouter.allowedMethods());

  // Attach the mongo client so we can close it later if needed
  app.mongoClient = client;

  return app;
};
