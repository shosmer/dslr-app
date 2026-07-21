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
        // standalone (NOT fullscreen): fullscreen zeroed iOS safe-area insets
        // (SAT0/SAB0 on-device) and pinned the canvas to the top, stranding the
        // unreachable bottom strip below the nav bar. standalone bottom-aligns
        // the canvas so the nav bar sits flush at the physical bottom, native.
        display: "standalone",
        orientation: "portrait",
        background_color: "#1a1917",
        theme_color: "#1a1917",
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
