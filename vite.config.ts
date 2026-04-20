import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react-helmet-async"],
  },
  ssgOptions: {
    dirStyle: 'nested',
    includedRoutes: () => [
      "/",
      "/sponsors",
      "/about",
      "/docs/community-guide",
      "/privacy",
      "/docs",
      "/adventures/echoes-lost-in-orbit",
      "/adventures/building-cloudhaven",
      "/adventures/the-ai-observatory",
      "/adventures/echoes-lost-in-orbit/levels/beginner",
      "/adventures/echoes-lost-in-orbit/levels/intermediate",
      "/adventures/echoes-lost-in-orbit/levels/expert",
      "/adventures/building-cloudhaven/levels/beginner",
      "/adventures/building-cloudhaven/levels/intermediate",
      "/adventures/building-cloudhaven/levels/expert",
      "/adventures/the-ai-observatory/levels/beginner",
      "/adventures/the-ai-observatory/levels/intermediate",
      "/adventures/the-ai-observatory/levels/expert",
    ],
  },
}));
