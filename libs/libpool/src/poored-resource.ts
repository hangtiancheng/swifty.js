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

export type PooledResourceState =
  | "ALLOCATED"
  | "IDLE"
  | "INVALID"
  | "RETURNING"
  | "VALIDATION";

class PooledResource<T> {
  creationTime: number;
  lastReturnTime: number | undefined;
  lastBorrowTime: number | undefined;
  lastIdleTime: number | undefined;
  obj: T;
  state: PooledResourceState;

  constructor(resource: T) {
    this.creationTime = Date.now();
    this.lastReturnTime = undefined;
    this.lastBorrowTime = undefined;
    this.lastIdleTime = undefined;
    this.obj = resource;
    this.state = "IDLE";
  }

  allocate(): void {
    this.lastBorrowTime = Date.now();
    this.state = "ALLOCATED";
  }

  deallocate(): void {
    this.lastReturnTime = Date.now();
    this.state = "IDLE";
  }

  invalidate(): void {
    this.state = "INVALID";
  }

  test(): void {
    this.state = "VALIDATION";
  }

  idle(): void {
    this.lastIdleTime = Date.now();
    this.state = "IDLE";
  }

  returning(): void {
    this.state = "RETURNING";
  }
}

export default PooledResource;
