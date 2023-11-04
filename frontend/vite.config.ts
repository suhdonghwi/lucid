import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
// NOTE:
// This is a workaround for externalizing `node-fetch` in vite dev server.
// https://github.com/vitejs/vite/issues/6582
import externalize from "vite-plugin-externalize-dependencies";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
    externalize({ externals: ["node-fetch"] }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  worker: {
    format: "es",
    rollupOptions: {
      external: ["node-fetch"],
    },
  },
});
