import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/kantumruy-pro/400.css";
import "@fontsource/kantumruy-pro/700.css";
import { App } from "./App";
import { registerSW } from "virtual:pwa-register";
import "./index.css";

registerSW({ immediate: true });

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
