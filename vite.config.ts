import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import fs from "fs";
import path from "path";

const PYTHON_SETUP_FILES = [];
const PYTHON_PATH = "./src/python";

fs.readdir(PYTHON_PATH, (err, files) => {
  if (err) {
    console.log("Error reading directory: ", err);
    return;
  }

  for (const file of files) {
    if (!file.endsWith(".py")) continue;

    const file_path = path.join(PYTHON_PATH, file);
    fs.readFile(file_path, "utf8", (_, data) => {
      PYTHON_SETUP_FILES.push({ name: file, code: data });
    });
  }
});

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
  ],
  define: { PYTHON_SETUP_FILES },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  worker: {
    format: "es",
  },
});
