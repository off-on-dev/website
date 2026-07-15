import { useState, useEffect, useRef, useId, type JSX, type CSSProperties } from "react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTIES, type Difficulty } from "@/data/adventures/filter-utils";
import { DIFFICULTY_VAR } from "@/lib/difficulty";

const difficultyPillStyle = (diff: Difficulty, isActive: boolean): CSSProperties => {
  const v = DIFFICULTY_VAR[diff];
  return {
    // borderStyle must be set inline because DIFF_PILL_BASE's `border` class is the
    // only source of border-style:solid; inline borderWidth/borderColor alone don't render borders.
    borderStyle: "solid",
    backgroundColor: `hsl(var(--difficulty-${v}-bg))`,
    borderColor: isActive ? `hsl(var(--difficulty-${v}))` : `hsl(var(--difficulty-${v}-border))`,
    borderWidth: "2px",
    color: `hsl(var(--difficulty-text))`,
  };
};

// border-style in the `border` class of DIFF_PILL_BASE is what enables inline borderWidth/borderColor.
const DIFF_PILL_BASE = "filter-pill inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 min-h-[44px] text-sm font-medium leading-none transition-all duration-200 focus-ring cursor-pointer";

const allLevelsPillStyle = (isActive: boolean): CSSProperties => ({
  borderStyle: "solid",
  backgroundColor: isActive ? "hsl(var(--foreground))" : "transparent",
  borderColor: isActive ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)",
  borderWidth: "2px",
  color: isActive ? "hsl(var(--background))" : "hsl(var(--foreground))",
});

// Visual inverse of allLevelsPillStyle: outlined (transparent bg) instead of filled.
// Inactive state mirrors pill-inactive: border-border + text-secondary (text-dim).
const allToolsPillStyle = (isActive: boolean): CSSProperties => ({
  borderStyle: "solid",
  backgroundColor: "transparent",
  borderColor: isActive ? "hsl(var(--foreground))" : "hsl(var(--border))",
  borderWidth: "2px",
  color: isActive ? "hsl(var(--foreground))" : "hsl(var(--text-secondary))",
});

export type { Difficulty };

type ChallengeFiltersProps = {
  activeTopics: string[];
  activeDifficulty: string | null;
  tags: string[];
  onDifficultyChange: (diff: Difficulty | null) => void;
  onTopicsChange: (topics: string[]) => void;
};

export const ChallengeFilters = ({
  activeTopics,
  activeDifficulty,
  tags,
  onDifficultyChange,
  onTopicsChange,
}: ChallengeFiltersProps): JSX.Element => {
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const difficultyTriggerRef = useRef<HTMLButtonElement>(null);
  const tagsTriggerRef = useRef<HTMLButtonElement>(null);
  const difficultyGroupId = useId();
  const tagsGroupId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (difficultyRef.current && !difficultyRef.current.contains(target)) {
        setDifficultyOpen(false);
      }
      if (tagsRef.current && !tagsRef.current.contains(target)) {
        setTagsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEscapeKey(() => {
    if (difficultyOpen) {
      setDifficultyOpen(false);
      difficultyTriggerRef.current?.focus();
    } else if (tagsOpen) {
      setTagsOpen(false);
      tagsTriggerRef.current?.focus();
    }
  }, difficultyOpen || tagsOpen);

  const handleDifficultyClick = (diff: Difficulty): void => {
    onDifficultyChange(activeDifficulty === diff ? null : diff);
  };

  const handleTagClick = (tag: string): void => {
    onTopicsChange(
      activeTopics.includes(tag)
        ? activeTopics.filter((t) => t !== tag)
        : [...activeTopics, tag]
    );
  };

  // Arrow-key navigation within an open filter panel. Called from onKeyDown on
  // each panel button; walks up to the nearest role="group" to find siblings.
  const navigatePanel = (e: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const panel = e.currentTarget.closest<HTMLElement>('[role="group"]');
    if (!panel) return;
    const btns = Array.from(panel.querySelectorAll<HTMLButtonElement>("button"));
    const idx = btns.indexOf(e.currentTarget);
    if (idx === -1) return;
    btns[(e.key === "ArrowDown" ? idx + 1 : idx - 1 + btns.length) % btns.length].focus();
  };

  const dropdownItemClass = (isActive: boolean): string => cn(
    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors focus-ring",
    isActive
      ? "text-primary bg-primary/10"
      : "text-dim hover:bg-primary/5 hover:text-foreground dark:hover:text-primary"
  );

  return (
    <div className="mb-8">

      {/* Mobile / tablet: both dropdowns side by side */}
      <div className="flex items-center gap-2 lg:hidden">

        {/* Difficulty dropdown */}
        <div className="relative" ref={difficultyRef}>
          <button
            ref={difficultyTriggerRef}
            type="button"
            onClick={() => { setDifficultyOpen((o) => !o); setTagsOpen(false); }}
            aria-expanded={difficultyOpen}
            aria-controls={difficultyGroupId}
            className={cn(
              activeDifficulty !== null ? "pill-active" : "pill-inactive",
              "px-6 gap-2"
            )}
            style={activeDifficulty !== null ? difficultyPillStyle(activeDifficulty as Difficulty, true) : allLevelsPillStyle(true)}
          >
            {activeDifficulty ?? "All Levels"}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn("transition-transform duration-200", difficultyOpen && "rotate-180")}
            />
          </button>
          <div
              id={difficultyGroupId}
              role="group"
              aria-label="Filter by difficulty"
              hidden={!difficultyOpen}
              className="absolute top-full left-0 z-20 mt-2 min-w-[160px] rounded-xl border border-border bg-[hsl(var(--surface))] p-1.5 shadow-lg"
            >
              <button type="button" aria-pressed={activeDifficulty === null}
                onClick={() => { onDifficultyChange(null); setDifficultyOpen(false); difficultyTriggerRef.current?.focus(); }}
                onKeyDown={navigatePanel}
                className={dropdownItemClass(activeDifficulty === null)}
              >
                {activeDifficulty === null ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                All Levels
              </button>
              {DIFFICULTIES.map((diff) => {
                const isActive = activeDifficulty === diff;
                const v = DIFFICULTY_VAR[diff];
                return (
                  <button key={diff} type="button" aria-pressed={isActive}
                    onClick={() => { handleDifficultyClick(diff); setDifficultyOpen(false); difficultyTriggerRef.current?.focus(); }}
                    onKeyDown={navigatePanel}
                    className={dropdownItemClass(isActive)}
                  >
                    <span className="w-[13px] inline-flex items-center justify-center shrink-0">
                      {isActive
                        ? <Check size={13} aria-hidden="true" />
                        : <span
                            className="h-2.5 w-2.5 rounded-sm"
                            aria-hidden="true"
                            style={{
                              backgroundColor: `hsl(var(--difficulty-${v}-bg))`,
                              border: `1px solid hsl(var(--difficulty-${v}-border))`,
                            }}
                          />
                      }
                    </span>
                    {diff}
                  </button>
                );
              })}
            </div>
        </div>

        {/* Tags dropdown */}
        <div className="relative" ref={tagsRef}>
          <button
            ref={tagsTriggerRef}
            type="button"
            onClick={() => { setTagsOpen((o) => !o); setDifficultyOpen(false); }}
            aria-expanded={tagsOpen}
            aria-controls={tagsGroupId}
            className={cn(
              activeTopics.length > 0 ? "pill-active" : "pill-inactive",
              "px-6 gap-2"
            )}
            style={activeTopics.length === 0 ? allToolsPillStyle(true) : undefined}
          >
            {activeTopics.length === 0 ? "All Tools" : `${activeTopics.length} tool${activeTopics.length !== 1 ? "s" : ""} selected`}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn("transition-transform duration-200", tagsOpen && "rotate-180")}
            />
          </button>
          <div
              id={tagsGroupId}
              role="group"
              aria-label="Filter by technology"
              hidden={!tagsOpen}
              className="absolute top-full left-0 z-20 mt-2 min-w-[200px] rounded-xl border border-border bg-[hsl(var(--surface))] p-1.5 shadow-lg"
            >
              <button type="button" aria-pressed={activeTopics.length === 0}
                onClick={() => { onTopicsChange([]); setTagsOpen(false); tagsTriggerRef.current?.focus(); }}
                onKeyDown={navigatePanel}
                className={dropdownItemClass(activeTopics.length === 0)}
              >
                {activeTopics.length === 0 ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                All Tools
              </button>
              {tags.map((tag) => {
                const isActive = activeTopics.includes(tag);
                return (
                  <button key={tag} type="button" aria-pressed={isActive}
                    onClick={() => { handleTagClick(tag); setTagsOpen(false); tagsTriggerRef.current?.focus(); }}
                    onKeyDown={navigatePanel}
                    className={dropdownItemClass(isActive)}
                  >
                    {isActive ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                    {tag}
                  </button>
                );
              })}
            </div>
        </div>

      </div>

      {/* Desktop: two pill rows */}
      <div className="hidden lg:block space-y-3">

        <div role="group" aria-label="Filter by difficulty" className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
          <button type="button" onClick={() => onDifficultyChange(null)} aria-pressed={activeDifficulty === null}
            className={DIFF_PILL_BASE}
            style={allLevelsPillStyle(activeDifficulty === null)}
          >
            All Levels
          </button>
          {DIFFICULTIES.map((diff) => {
            const isActive = activeDifficulty === diff;
            return (
              <button key={diff} type="button" onClick={() => handleDifficultyClick(diff)} aria-pressed={isActive}
                className={DIFF_PILL_BASE}
                style={difficultyPillStyle(diff, isActive)}
              >
                {diff}
                {isActive && <X size={11} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div role="group" aria-label="Filter by technology" className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onTopicsChange([])} aria-pressed={activeTopics.length === 0}
            className={DIFF_PILL_BASE}
            style={allToolsPillStyle(activeTopics.length === 0)}
          >
            All Tools
          </button>
          {tags.map((tag) => {
            const isActive = activeTopics.includes(tag);
            return (
              <button key={tag} type="button" onClick={() => handleTagClick(tag)} aria-pressed={isActive}
                className={isActive ? "pill-active" : "pill-inactive"}
              >
                {tag}
                {isActive && <X size={11} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};
