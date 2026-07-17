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

import { TcpPool } from "./tcp-pool.js";

async function main() {
  const pool = new TcpPool({
    remoteHost: "127.0.0.1",
    remotePort: 9000,
    minConnections: 1,
    maxConnections: 5,
    expireTime: 30_000,
    sendTimeout: 3_000,
    retryDelay: 500,
  });

  const testCases = [
    { name: "echo", data: { cmd: "echo", data: "hello" } },
    { name: "delay-2s", data: { cmd: "delay", ms: 2000 } },
    { name: "hang-timeout", data: { cmd: "hang" } },
    { name: "drop-connection", data: { cmd: "drop" } },
    { name: "malformed-json", data: { cmd: "malformed" } },
    { name: "close-after-send", data: { cmd: "close-after-send" } },
  ];

  for (const testCase of testCases) {
    try {
      const payload = JSON.stringify(testCase.data) + "\r";
      const result = await pool.send(payload);
      console.log(`[${testCase.name}] success:`, result);
    } catch (err) {
      console.error(`[${testCase.name}] error:`, err);
    }
  }

  await pool.destroy();
}

main().catch(console.error);
