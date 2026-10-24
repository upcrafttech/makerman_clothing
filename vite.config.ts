// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      port: 3000,
      strictPort: false,
      proxy: {
        "/api": {
          target: process.env.VITE_API_BASE_URL
            ? process.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
            : "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  nitro: {
    preset:
      process.env["NITRO_PRESET"] ||
      (process.env["NETLIFY"] ? "netlify" : "cloudflare-module"),
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
