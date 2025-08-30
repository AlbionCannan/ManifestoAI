import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./countryPortals.css"; // optional / safe
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);
