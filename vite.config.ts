import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import fs from "fs";
import path from "path";

const PYTHON_SETUP_FILES = [];
const SETUP_PATH = "./src/setup";

fs.readdir(SETUP_PATH, (err, files) => {
  if (err) {
    console.log("Error reading directory: ", err);
    return;
  }

  for (const file of files) {
    const file_path = path.join(SETUP_PATH, file);
    fs.readFile(file_path, "utf8", (_, data) => {
      PYTHON_SETUP_FILES.push({ name: file, code: data });
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  define: { PYTHON_SETUP_FILES },
});
