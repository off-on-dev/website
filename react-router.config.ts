import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  appDirectory: "src",
  buildDirectory: "dist",
  basename: process.env.VITE_BASE_PATH ?? "/",
  prerender: [
    "/",
    "/404",
    "/sponsors",
    "/about",
    "/handbook",
    "/privacy",
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
} satisfies Config;
