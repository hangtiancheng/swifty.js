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

import Deferred from "./deferred.js";
import { TimeoutError } from "./errors.js";

class ResourceRequest<T> extends Deferred<T> {
  private creationTimestamp: number;
  private timeout: NodeJS.Timeout | null;

  constructor(ttl?: number) {
    super();
    this.creationTimestamp = Date.now();
    this.timeout = null;
    if (ttl !== undefined) {
      this.setTimeout(ttl);
    }
  }

  setTimeout(delay: number): void {
    if (this.state !== Deferred.PENDING) {
      return;
    }
    if (!Number.isInteger(delay) || delay <= 0) {
      throw new Error("Delay must be a positive integer");
    }
    const age = Date.now() - this.creationTimestamp;
    if (this.timeout) {
      this.removeTimeout();
    }
    this.timeout = setTimeout(
      this.fireTimeout.bind(this),
      Math.max(delay - age, 0),
    );
  }

  removeTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = null;
  }

  private fireTimeout(): void {
    this.reject(new TimeoutError("resource request timed out"));
  }

  override reject(reason?: any): void {
    this.removeTimeout();
    super.reject(reason);
  }

  override resolve(value: T | PromiseLike<T>): void {
    this.removeTimeout();
    super.resolve(value);
  }
}

export default ResourceRequest;
