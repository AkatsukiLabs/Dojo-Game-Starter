import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    plugins: [react(), wasm(), topLevelAwait()],
    server: {
        port: 3001,
        //    https: {
        //      key: fs.readFileSync("mkcert+1-key.pem"), // Path to private key file
        //      cert: fs.readFileSync("mkcert+1.pem"),   // Path to certificate file
        //  },
    },
});
