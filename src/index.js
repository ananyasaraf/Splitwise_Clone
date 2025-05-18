import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Correct import for createRoot
import App from "./App";
import "../src/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
