/// <reference types="vitest/config" />
import path from "node:path";
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

function buildId(): string {
  try {
    const sha = execSync("git rev-parse --short HEAD").toString().trim();
    const date = new Date().toISOString().slice(5, 16).replace("T", " ");
    return `${sha} · ${date}`;
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@content": path.resolve(__dirname, "content"),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // autoUpdate: new SW takes over on next launch (skipWaiting+clientsClaim).
      // "Never break mid-trip" is enforced by the Jul 31 deploy freeze, not by
      // making updates unreachable — iOS standalone never surfaced the prompt.
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "icons/*.svg"],
      manifest: {
        name: "Ljósmynd — D7100 Field Companion",
        short_name: "Ljósmynd",
        description:
          "Offline-first photography companion for the Nikon D7100 — lighting analyzer, field guides, and Eclipse Mode for Aug 12, 2026.",
        start_url: "/",
        // fullscreen: iOS standalone reserves a ~62pt strip at the bottom of
        // the canvas (measured on-device 7/20); fullscreen requests the whole
        // screen. display_override falls back gracefully where unsupported.
        display: "fullscreen",
        display_override: ["fullscreen", "standalone"],
        orientation: "portrait",
        // Painted by iOS on the launch screen AND inside the strip it reserves
        // below the app canvas in standalone mode — matched to the tab bar's
        // rendered tone (oklch(0.16 0.007 60 / 0.85) over --bg-app) so the
        // reserved strip reads as part of the bar, ESPN-style. Not an in-app
        // design change: no pixel the app itself draws uses this value.
        background_color: "#0f0c09",
        theme_color: "#0f0c09",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Offline-first P0 rule: precache the entire app shell, content, data, fonts.
        globPatterns: ["**/*.{js,css,html,woff2,json,svg,png}"],
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
