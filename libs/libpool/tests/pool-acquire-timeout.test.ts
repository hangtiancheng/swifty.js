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

import { describe, it, expect } from "vitest";
import type { IFactory } from "../src/factory-validator.js";
import type { IOptions } from "../src/pool-default.js";
import { createPool } from "../src/index.js";

describe("pool-acquire-timeout.test.ts", () => {
  it("test", async () => {
    const factory: IFactory<{ id: number }> = {
      create: () => {
        return new Promise<{ id: number }>((resolve) => {
          setTimeout(() => {
            resolve({ id: 1 });
          }, 100);
        });
      },
      destroy: () => {
        return Promise.resolve();
      },
    };
    const config: IOptions = {
      acquireTimeoutMilliseconds: 20,
      idleTimeoutMilliseconds: 150,
    };
    const pool = createPool(factory, config);
    try {
      await pool.acquire();
      expect.fail("Should have timed out");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      if (err instanceof Error) {
        expect(err.message).toMatch(/resource request timed out/);
      }
    } finally {
      await pool.drain();
      await pool.clear();
    }
  });

  it("test2", async () => {
    const myResource = {};
    const factory: IFactory<{}> = {
      create: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(myResource);
          }, 10);
        });
      },
      destroy: () => {
        return Promise.resolve();
      },
    };
    const config: IOptions = {
      acquireTimeoutMilliseconds: 400,
    };
    const pool = createPool(factory, config);
    try {
      const resource = await pool.acquire();
      expect(resource).toBe(myResource);
      await pool.release(resource);
    } finally {
      await pool.drain();
      await pool.clear();
    }
  });
});
