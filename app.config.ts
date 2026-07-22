import { defineConfig } from "@solidjs/start/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    compatibilityDate: "2026-07-22",
  },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ssr: {
      noExternal: ["@solidjs/router"],
    },
  },
});
