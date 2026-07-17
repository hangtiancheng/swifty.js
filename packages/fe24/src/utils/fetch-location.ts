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

/**
 *
 * @param address 地址字符串
 * @returns [lat, lng]
 */
export async function fetchLocation(address: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=${import.meta.env.VITE_AMAP_WEB_KEY || "22d05f3b745408a2870428df1c3f58a9"}&address=${address}`,
    )
      .then((res) => res.json())
      .then((jsonData) =>
        resolve(
          (jsonData.geocodes[0].location as string)
            .split(",")
            .map((item) => Number.parseFloat(item) /** Number.parseFloat */),
        ),
      )
      .catch((err) => {
        reject(err);
      });
  });
}
