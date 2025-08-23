import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./countryPortals.css"; // keep or leave empty; safe to include
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);
