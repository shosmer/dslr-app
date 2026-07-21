import React from "react";
import ReactDOM from "react-dom/client";

// Self-hosted fonts (PRD §12 — offline, no CDN)
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";

import "./styles/index.css";
import { App } from "./app/App";
import { registerSW } from "virtual:pwa-register";

// Ask the browser not to evict our offline content mid-trip (PRD §13)
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

// Register the service worker and actively check for updates whenever the
// app comes back to the foreground (iOS standalone never checks on its own
// schedule) — a fresh deploy lands on the next launch, no force-quit ritual.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void reg.update().catch(() => {});
    });
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
