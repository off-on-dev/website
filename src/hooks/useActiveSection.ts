import { useEffect, useState } from "react";

/**
 * Observes a set of section IDs and returns the ID of whichever section
 * is currently intersecting the viewport, or null if none are.
 *
 * Uses IntersectionObserver (runs off the main thread) so there is no
 * scroll event listener and no per-frame work on the main thread.
 */
export function useActiveSection(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
        // If no section is intersecting, clear the active id
        const anyIntersecting = entries.some((e) => e.isIntersecting);
        if (!anyIntersecting) {
          setActiveId(null);
        }
      },
      {
        // Fire when at least 20% of the section enters the viewport.
        // High enough to avoid spurious triggers at section edges,
        // low enough to work on short viewport heights.
        threshold: 0.2,
      },
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [sectionIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps -- join(",") is a stable serialization; avoids re-runs when the caller passes a new array reference with identical IDs

  return activeId;
}
