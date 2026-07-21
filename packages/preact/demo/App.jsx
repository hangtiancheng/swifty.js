/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** @jsx Preact.createElement */
import * as Preact from "../src";
import { useEffect, useState } from "../src/hooks";

function Demo() {
  const [cnt, setCnt] = useState(1);
  const [cnt2, setCnt2] = useState(2);
  const [cnt3, setCnt3] = useState(3);

  const handleClick = () => {
    setCnt(cnt + 1);
  };

  const handleClick2 = () => {
    setCnt2((cnt2) => cnt2 + 1);
  };

  const handleClick3 = () => {
    console.log(cnt3);
    setCnt3((cnt3) => cnt3);
  };

  useEffect(() => {
    console.log("onMounted");
    return () => {
      console.log("Cleanup");
    };
  }, []);

  useEffect(() => {
    console.log(`cnt: ${cnt}`);
    return () => {
      console.log("cnt Cleanup");
    };
  }, [cnt]);

  useEffect(() => {
    console.log(`cnt2: ${cnt2}`);
    return () => {
      console.log("cnt2 Cleanup");
    };
  }, [cnt2]);

  useEffect(() => {
    console.log(`cnt3: ${cnt3}`);
    return () => {
      console.log("cnt3 Cleanup");
    };
  }, [cnt3]);

  return (
    <div>
      <div>cnt: {cnt}</div>
      <button onClick={handleClick}>addCnt</button>

      <div>cnt2: {cnt2}</div>
      <button onClick={handleClick2}>addCnt2</button>

      <div>cnt3: {cnt3}</div>
      <button onClick={handleClick3}>addCnt3</button>
    </div>
  );
}

export default function App() {
  return (
    <div id="app">
      <Demo />
    </div>
  );
}
