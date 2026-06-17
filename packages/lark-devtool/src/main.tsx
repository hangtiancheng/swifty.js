import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
