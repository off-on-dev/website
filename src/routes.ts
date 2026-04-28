import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("Layout.tsx", [
    index("pages/Index.tsx"),
    route("adventures/:id", "pages/AdventureDetail.tsx"),
    route("adventures/:id/levels/:levelId", "pages/ChallengeDetail.tsx"),
    route("sponsors", "pages/Sponsors.tsx"),
    route("about", "pages/About.tsx"),
    route("handbook", "pages/CommunityGuide.tsx"),
    route("404", "pages/NotFound.tsx"),
    route("privacy", "pages/Privacy.tsx"),
    route("docs", "pages/redirects/DocsRedirect.tsx"),
    route("docs/community-guide", "pages/redirects/DocsCommunityGuideRedirect.tsx"),
    route("community-guide", "pages/redirects/CommunityGuideRedirect.tsx"),
    route("topics/:tag", "pages/redirects/TopicsTagRedirect.tsx"),
    route("*", "pages/CatchAll.tsx"),
  ]),
] satisfies RouteConfig;
