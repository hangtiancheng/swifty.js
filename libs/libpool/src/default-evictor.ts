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

import PooledResource from "./poored-resource.js";

export interface IEvictorConfig {
  softIdleTimeoutMilliseconds: number;
  idleTimeoutMilliseconds: number;
  min: number;
}

export interface IEvictor<T> {
  evict(
    config: IEvictorConfig,
    pooledResource: PooledResource<T>,
    availableObjectsCount: number,
  ): boolean;
}

class DefaultEvictor<T> implements IEvictor<T> {
  evict(
    config: IEvictorConfig,
    pooledResource: PooledResource<T>,
    availableObjectsCount: number,
  ): boolean {
    const idleTime = Date.now() - (pooledResource.lastIdleTime ?? 0);
    if (
      config.softIdleTimeoutMilliseconds > 0 &&
      config.softIdleTimeoutMilliseconds < idleTime &&
      config.min < availableObjectsCount
    ) {
      return true;
    }
    if (config.idleTimeoutMilliseconds < idleTime) {
      return true;
    }
    return false;
  }
}

export default DefaultEvictor;
