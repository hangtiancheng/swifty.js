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

export interface IOptions {
  max?: number; // Default 1
  min?: number; // Default 0
  fifo?: boolean; // Default true
  autoStart?: boolean; // Default true
  testOnBorrow?: boolean; // Default false
  testOnReturn?: boolean; // Default false
  priorityRange?: number; // Default 1
  maxWaitingClients?: number | undefined; // Default undefined
  numTestsPerEvictionRun?: number; // Default 3
  idleTimeoutMilliseconds?: number; // Default 30000
  acquireTimeoutMilliseconds?: number | undefined; // Default undefined
  destroyTimeoutMilliseconds?: number | undefined; // Default undefined
  softIdleTimeoutMilliseconds?: number; // Default -1
  evictionRunIntervalMilliseconds?: number; // Default 0
}

class PoolDefaults implements IOptions {
  max: number;
  min: number;
  fifo: boolean;
  autoStart: boolean;
  testOnBorrow: boolean;
  testOnReturn: boolean;
  priorityRange: number;
  maxWaitingClients?: number | undefined;
  numTestsPerEvictionRun: number;
  idleTimeoutMilliseconds: number;
  acquireTimeoutMilliseconds?: number | undefined;
  destroyTimeoutMilliseconds?: number | undefined;
  softIdleTimeoutMilliseconds: number;
  evictionRunIntervalMilliseconds: number;

  constructor() {
    this.max = 1;
    this.min = 0;
    this.fifo = true;
    this.autoStart = true;
    this.testOnBorrow = false;
    this.testOnReturn = false;
    this.priorityRange = 1;
    this.maxWaitingClients = undefined; // 10;
    this.numTestsPerEvictionRun = 3;
    this.idleTimeoutMilliseconds = 30000;
    this.acquireTimeoutMilliseconds = undefined; // 10;
    this.destroyTimeoutMilliseconds = undefined; // 10;
    this.softIdleTimeoutMilliseconds = -1;
    this.evictionRunIntervalMilliseconds = 0;
  }
}

export default PoolDefaults;
