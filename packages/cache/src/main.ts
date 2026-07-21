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

import { Group, newGroup } from "./group.js";
import { Server } from "./server.js";
import { ClientPicker } from "./client-picker.js";
import { getLocalIP } from "./utils.js";

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

async function startCacheServer(
  bindAddr: string,
  advertiseAddr: string,
  group: Group,
): Promise<void> {
  const server = new Server(bindAddr, DEFAULT_SVC_NAME, { advertiseAddr });
  await server.start();

  const picker = new ClientPicker(advertiseAddr, {
    serviceName: DEFAULT_SVC_NAME,
  });
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

  let host: string;
  try {
    host = getLocalIP();
  } catch {
    host = "127.0.0.1";
  }

  const bindAddr = `0.0.0.0:${port}`;
  const advertiseAddr = `${host}:${port}`;
  const group = createGroup();
  await startCacheServer(bindAddr, advertiseAddr, group);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
