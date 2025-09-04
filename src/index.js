import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root in public/index.html");
createRoot(el).render(<App />);
