import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const base = process.env.VITE_BASE_PATH ?? "/";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [tailwindcss(), reactRouter()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("/node_modules/react-router/") ||
            id.includes("/node_modules/@react-router/")
          ) {
            return "vendor-router";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
