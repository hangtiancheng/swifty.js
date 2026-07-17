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

/* eslint-disable @typescript-eslint/no-explicit-any */
import httpClient from "@/utils/axios";

interface IResponseData {
  code: number;
  message: string;
  data: any;
}

async function get(url: string, params?: any): Promise<IResponseData> {
  return httpClient.get(url, { params });
}

async function post(url: string, data?: any): Promise<IResponseData> {
  return httpClient.post(url, data);
}

export { get, post };
