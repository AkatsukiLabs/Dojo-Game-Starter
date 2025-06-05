import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import fs from "fs";

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  server: {
    port: 3002,
    https: {
      key: fs.readFileSync("mkcert+1-key.pem"),
      cert: fs.readFileSync("mkcert+1.pem"),
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
});