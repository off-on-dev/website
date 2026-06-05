import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import { ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";

const STARTER_NUDGE_KEY = "starter_nudge_dismissed";
const starterAdventure = ADVENTURE_SUMMARIES.find((a) => a.isLive);
const starterLevel = starterAdventure?.levels.find((l) => l.difficulty === "Beginner");

export const StarterNudge = (): JSX.Element | null => {
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    if (starterLevel && !localStorage.getItem(STARTER_NUDGE_KEY)) {
      const id = setTimeout(() => setShowNudge(true));
      return () => clearTimeout(id);
    }
  }, []);

  const dismissNudge = (): void => {
    localStorage.setItem(STARTER_NUDGE_KEY, "1");
    setShowNudge(false);
  };

  if (!showNudge || !starterAdventure || !starterLevel) return null;

  return (
    <div className="-mt-2 mb-8 flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-sm">
      <p className="text-primary-foreground">
        Each adventure focuses on one open source technology, with challenges at different difficulty levels.{" "}
        <span className="block mt-1">
          New here?{" "}
          <Link
            to={`/adventures/${starterAdventure.id}/levels/${starterLevel.id}/`}
            className="font-bold underline decoration-2 underline-offset-2 text-primary-foreground hover:opacity-75"
          >
            Start with {starterAdventure.title}, a {starterAdventure.tags[0]} adventure
          </Link>
        </span>
      </p>
      <button
        type="button"
        onClick={dismissNudge}
        aria-label="Dismiss suggestion"
        className="shrink-0 inline-flex min-h-6 min-w-6 items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
};
