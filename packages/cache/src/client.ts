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

import * as grpc from "@grpc/grpc-js";
import { proto } from "./proto/index.js";
import { Peer } from "./peers.js";

export class Client implements Peer {
  private addr: string;
  private grpcClient: any;

  constructor(addr: string) {
    this.addr = addr;
    this.grpcClient = new proto.pb.SwiftyCache(
      addr,
      grpc.credentials.createInsecure(),
    );
  }

  get(group: string, key: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + 3000);
      this.grpcClient.Get(
        { group, key },
        { deadline, waitForReady: true },
        (err: grpc.ServiceError | null, response: any) => {
          if (err) {
            reject(
              new Error(`failed to get value from swifty_cache: ${err.message}`),
            );
            return;
          }
          resolve(Buffer.from(response.value));
        },
      );
    });
  }

  set(group: string, key: string, value: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + 3000);
      this.grpcClient.Set(
        { group, key, value },
        { deadline, waitForReady: true },
        (err: grpc.ServiceError | null) => {
          if (err) {
            reject(
              new Error(`failed to set value to swifty_cache: ${err.message}`),
            );
            return;
          }
          resolve();
        },
      );
    });
  }

  delete(group: string, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + 3000);
      this.grpcClient.Delete(
        { group, key },
        { deadline, waitForReady: true },
        (err: grpc.ServiceError | null, response: any) => {
          if (err) {
            reject(
              new Error(
                `failed to delete value from swifty_cache: ${err.message}`,
              ),
            );
            return;
          }
          resolve(response.value);
        },
      );
    });
  }

  async close(): Promise<void> {
    this.grpcClient.close();
  }

  getAddr(): string {
    return this.addr;
  }
}
