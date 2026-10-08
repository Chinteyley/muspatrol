import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "samples/**/*",
        "samples/credits.json",
      ],
      manifest: {
        name: "MusPatrol — មូស Patrol",
        short_name: "MusPatrol",
        description:
          "After the rain, walk 10 minutes and evict mosquito daycares. CLIP names the pot; code decides TIP/SCRUB/COVER/TOSS.",
        theme_color: "#08110e",
        background_color: "#08110e",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2,json,webmanifest}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/samples\/.*\.(jpg|jpeg|png|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "muspatrol-samples",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "muspatrol-weather",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 12 },
            },
          },
        ],
      },
    }),
  ],
  worker: { format: "es" },
  optimizeDeps: {
    exclude: ["@huggingface/transformers", "@mediapipe/tasks-genai"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
