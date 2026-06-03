import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect runs synchronously after DOM mutations but before paint,
// preventing flashes when imperative DOM updates must match React's state.
// During SSG/SSR there is no DOM, so React skips useLayoutEffect and warns.
// This export uses the real thing in browsers and falls back silently on the server.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
