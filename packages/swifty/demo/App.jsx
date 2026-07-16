/** @jsx Preact.createElement */
import Preact from "../src";
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
