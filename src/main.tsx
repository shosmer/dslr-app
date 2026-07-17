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

// Ask the browser not to evict our offline content mid-trip (PRD §13)
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
