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
import { FACTORY_DESTROY_ERROR } from "../src/errors.js";

describe("pool-destroy-timeout.test.ts", () => {
  it("test", async () => {
    const factory: IFactory<{}> = {
      create: () => Promise.resolve({}),
      destroy: () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 100);
        });
      },
    };
    const config: IOptions = {
      destroyTimeoutMilliseconds: 20,
    };
    const pool = createPool(factory, config);
    const resource = await pool.acquire();
    pool.destroy(resource);
    await new Promise<void>((resolve) => {
      pool.once(FACTORY_DESTROY_ERROR, (err) => {
        expect(err).toBeInstanceOf(Error);
        if (err instanceof Error) {
          expect(err.message).toMatch(/destroy timed out/);
        }
        resolve();
      });
    });
  });

  it("test2", async () => {
    const factory: IFactory<{}> = {
      create: () => Promise.resolve({}),
      destroy: () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 10);
        });
      },
    };
    const config: IOptions = {
      destroyTimeoutMilliseconds: 400,
    };
    const pool = createPool(factory, config);
    let errorEmitted = false;
    pool.once(FACTORY_DESTROY_ERROR, () => {
      errorEmitted = true;
    });
    const resource = await pool.acquire();
    pool.destroy(resource);
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 20);
    });
    expect(errorEmitted).toBe(false);
  });
});
