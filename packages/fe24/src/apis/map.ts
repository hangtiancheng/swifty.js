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

import { Api } from "@/constants/apis";
import type { ITreeList } from "@/types/map";
import type { IRobotList } from "@/types/robot";
import { get } from "@/utils/http";

export function markerListApi(): Promise<IRobotList> {
  return get(Api.MarkerList);
}

export function addressListApi(): Promise<ITreeList> {
  return get(Api.AddressList);
}
