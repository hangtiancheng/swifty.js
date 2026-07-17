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

/* eslint-disable */

// This file includes experimental React APIs exported from the "scheduler"
// npm package. Despite being explicitly marked as unstable some libraries
// already make use of them. This file is not a full replacement for the
// scheduler package, but includes the necessary shims to make those libraries
// work with Preact.

export var unstable_ImmediatePriority = 1;
export var unstable_UserBlockingPriority = 2;
export var unstable_NormalPriority = 3;
export var unstable_LowPriority = 4;
export var unstable_IdlePriority = 5;

export function unstable_runWithPriority(priority, callback) {
  return callback();
}

export var unstable_now = performance.now.bind(performance);
