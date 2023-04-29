import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import fs from "fs";
import path from "path";

const PYTHON_STARTERS = [];
const starters_path = "./src/starters";

fs.readdir(starters_path, (err, files) => {
  if (err) {
    console.log("Error reading directory:", err);
    return;
  }

  for (const file of files) {
    const file_path = path.join(starters_path, file);
    fs.readFile(file_path, "utf8", (_, data) => {
      PYTHON_STARTERS.push({ name: file, code: data });
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  define: { PYTHON_STARTERS },
});
