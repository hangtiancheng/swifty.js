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

interface IResource {
  id: number;
}

class ResourceFactory implements IFactory<IResource> {
  callCreate: number;
  created: number;
  destroyed: number;
  bin: IResource[];

  constructor() {
    this.callCreate = 0;
    this.created = 0;
    this.destroyed = 0;
    this.bin = [];
  }

  create(): Promise<IResource> {
    console.log(`[ResourceFactory] create call ${this.callCreate}`);
    return new Promise<IResource>((resolve) => {
      if (this.callCreate % 2 === 0) {
        setTimeout(() => {
          console.log(`[ResourceFactory] created ${this.created}`);
          resolve({ id: this.created++ });
        }, 10);
      } else {
        console.log(`[ResourceFactory] created ${this.created}`);
        resolve({ id: this.created++ });
      }
      this.callCreate++;
    });
  }

  validate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  destroy(resource: IResource): Promise<void> {
    console.log(`[ResourceFactory] destroying ${resource.id}`);
    this.destroyed++;
    this.bin.push(resource);
    return Promise.resolve();
  }
}

describe("gh-159.test.ts", () => {
  it("test", async () => {
    const resourceFactory = new ResourceFactory();
    const config: IOptions = {
      max: 10,
      min: 1,
      evictionRunIntervalMilliseconds: 500,
      idleTimeoutMilliseconds: 30000,
      testOnBorrow: true,
      autoStart: true,
    };
    const pool = createPool(resourceFactory, config);
    await pool.drain();
    console.log("[gh-159.test.ts] pool drained");
    await pool.clear();
    console.log("[gh-159.test.ts] pool cleared");
    expect(resourceFactory.created).toBe(resourceFactory.destroyed);
  });
});
