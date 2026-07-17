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

import { useState } from "react";
import { usePersistFn } from "../index.js";

export default () => {
  const [count, setCount] = useState(0);

  const persistFn1 = usePersistFn(() => {
    console.log(1);

    setCount((prev) => {
      console.log(2);
      return prev + 1;
    });
  });

  const persistFn2 = usePersistFn(() => {
    console.log(3, count);
    setCount(count + 1);
  });

  return (
    <>
      <button type="button" className="btn" onClick={persistFn1}>
        Add count {count}
      </button>
      <button type="button" className="btn" onClick={persistFn2}>
        Add count {count}
      </button>
    </>
  );
};
