import { useEffect, useLayoutEffect } from "react";

// Falls back to useEffect on the server where there is no DOM; prevents React's SSR useLayoutEffect warning.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
