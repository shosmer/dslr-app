/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
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
      registerType: "prompt", // never silently swap versions mid-trip (PRD §13)
      includeAssets: ["icons/*.png", "icons/*.svg"],
      manifest: {
        name: "Ljósmynd — D7100 Field Companion",
        short_name: "Ljósmynd",
        description:
          "Offline-first photography companion for the Nikon D7100 — lighting analyzer, field guides, and Eclipse Mode for Aug 12, 2026.",
        start_url: "/",
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
