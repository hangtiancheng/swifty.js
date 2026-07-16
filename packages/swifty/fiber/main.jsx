/** @jsx React.createElement */
import React from "./react.js";
import ReactDOM from "./react-dom.js";

import App from "./App.jsx";

const container = document.querySelector("#root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
