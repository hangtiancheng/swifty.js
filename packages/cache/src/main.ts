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

import { Group, newGroup } from "./group.js";
import { Server } from "./server.js";
import { ClientPicker } from "./client-picker.js";

const GROUP_NAME = "user";
const MAX_BYTES = 2 << 10;
const DEFAULT_SVC_NAME = "swifty_cache";

const database: Record<string, string> = {
  Alice: "1",
  Bob: "2",
  Swifty: "3",
};

function createGroup(): Group {
  return newGroup(
    GROUP_NAME,
    MAX_BYTES,
    async (_ctx: AbortSignal, key: string): Promise<Buffer> => {
      console.log("[database] search key", key);
      if (key in database) {
        return Buffer.from(database[key]);
      }
      throw new Error(`key ${key} not found`);
    },
  );
}

async function startCacheServer(addr: string, group: Group): Promise<void> {
  const server = new Server(addr, DEFAULT_SVC_NAME);
  await server.start();

  const picker = new ClientPicker(addr, { serviceName: DEFAULT_SVC_NAME });
  await picker.start();
  group.registerPeers(picker);
  picker.printPeers();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let port = 50051;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p" || args[i] === "--port") {
      port = parseInt(args[i + 1]) || 50051;
      i++;
    }
  }

  const addr = `0.0.0.0:${port}`;
  const group = createGroup();
  await startCacheServer(addr, group);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
