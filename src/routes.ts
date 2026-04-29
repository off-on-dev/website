import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("Layout.tsx", [
    index("pages/Index.tsx"),
    route("adventures", "pages/Adventures.tsx"),
    route("adventures/:id", "pages/AdventureDetail.tsx"),
    route("adventures/:id/levels/:levelId", "pages/ChallengeDetail.tsx"),
    route("sponsors", "pages/Sponsors.tsx"),
    route("about", "pages/About.tsx"),
    route("handbook", "pages/CommunityGuide.tsx"),
    route("404", "pages/NotFound.tsx"),
    route("privacy", "pages/Privacy.tsx"),
    route("docs", "pages/redirects/HandbookRedirect.tsx", { id: "docs-redirect" }),
    route("docs/community-guide", "pages/redirects/HandbookRedirect.tsx", { id: "docs-community-guide-redirect" }),
    route("community-guide", "pages/redirects/HandbookRedirect.tsx", { id: "community-guide-redirect" }),
    route("topics/:tag", "pages/redirects/TopicsTagRedirect.tsx"),
    route("*", "pages/CatchAll.tsx"),
  ]),
] satisfies RouteConfig;
