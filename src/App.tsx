import { lazy } from "react";
import { Navigate } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import { Layout } from "./Layout";

const Index = lazy(() => import("./pages/Index"));
const AdventureDetail = lazy(() => import("./pages/AdventureDetail"));
const ChallengeDetail = lazy(() => import("./pages/ChallengeDetail"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const About = lazy(() => import("./pages/About"));
const CommunityGuide = lazy(() => import("./pages/CommunityGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Index /> },
      { path: "adventures/:id", element: <AdventureDetail /> },
      { path: "adventures/:id/levels/:levelId", element: <ChallengeDetail /> },
      { path: "sponsors", element: <Sponsors /> },
      { path: "about", element: <About /> },
      { path: "docs", element: <Navigate to="/handbook" replace /> },
      { path: "docs/community-guide", element: <Navigate to="/handbook" replace /> },
      { path: "community-guide", element: <Navigate to="/handbook" replace /> },
      { path: "handbook", element: <CommunityGuide /> },
      { path: "404", element: <NotFound /> },
      { path: "privacy", element: <Privacy /> },
      { path: "topics/:tag", element: <Navigate to={{ pathname: "/", hash: "#challenges" }} replace /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
