import { useState, useEffect, useRef, type JSX } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTIES, type Difficulty } from "@/data/adventures/filter-utils";

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setDifficultyOpen(false);
        setTagsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const dropdownItemClass = (isActive: boolean): string => cn(
    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors",
    isActive
      ? "text-primary bg-primary/10"
      : "text-[hsl(var(--text-secondary))] hover:bg-primary/5 hover:text-foreground dark:hover:text-primary"
  );

  return (
    <div className="mb-8">

      {/* Mobile / tablet: both dropdowns side by side */}
      <div className="flex items-center gap-2 lg:hidden">

        {/* Difficulty dropdown */}
        <div className="relative" ref={difficultyRef}>
          <button
            type="button"
            onClick={() => { setDifficultyOpen((o) => !o); setTagsOpen(false); }}
            aria-expanded={difficultyOpen}
            aria-haspopup="menu"
            className={cn(
              activeDifficulty !== null ? "pill-active" : "pill-inactive",
              "px-6 gap-2"
            )}
          >
            {activeDifficulty ?? "All Levels"}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn("transition-transform duration-200", difficultyOpen && "rotate-180")}
            />
          </button>
          {difficultyOpen && (
            <div
              role="menu"
              aria-label="Filter by difficulty"
              className="absolute top-full left-0 z-20 mt-2 min-w-[160px] rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-1.5 shadow-lg"
            >
              <button type="button" role="menuitemradio" aria-checked={activeDifficulty === null}
                onClick={() => { onDifficultyChange(null); setDifficultyOpen(false); }}
                className={dropdownItemClass(activeDifficulty === null)}
              >
                {activeDifficulty === null ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                All Levels
              </button>
              {DIFFICULTIES.map((diff) => {
                const isActive = activeDifficulty === diff;
                return (
                  <button key={diff} type="button" role="menuitemradio" aria-checked={isActive}
                    onClick={() => { handleDifficultyClick(diff); setDifficultyOpen(false); }}
                    className={dropdownItemClass(isActive)}
                  >
                    {isActive ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                    {diff}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags dropdown */}
        <div className="relative" ref={tagsRef}>
          <button
            type="button"
            onClick={() => { setTagsOpen((o) => !o); setDifficultyOpen(false); }}
            aria-expanded={tagsOpen}
            aria-haspopup="menu"
            className={cn(
              activeTopics.length > 0 ? "pill-active" : "pill-inactive",
              "px-6 gap-2"
            )}
          >
            {activeTopics.length === 0 ? "All Tools" : `${activeTopics.length} tool${activeTopics.length !== 1 ? "s" : ""} selected`}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={cn("transition-transform duration-200", tagsOpen && "rotate-180")}
            />
          </button>
          {tagsOpen && (
            <div
              role="menu"
              aria-label="Filter by technology"
              className="absolute top-full left-0 z-20 mt-2 min-w-[200px] rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-1.5 shadow-lg"
            >
              <button type="button" role="menuitemcheckbox" aria-checked={activeTopics.length === 0}
                onClick={() => { onTopicsChange([]); setTagsOpen(false); }}
                className={dropdownItemClass(activeTopics.length === 0)}
              >
                {activeTopics.length === 0 ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                All Tools
              </button>
              {tags.map((tag) => {
                const isActive = activeTopics.includes(tag);
                return (
                  <button key={tag} type="button" role="menuitemcheckbox" aria-checked={isActive}
                    onClick={() => { handleTagClick(tag); setTagsOpen(false); }}
                    className={dropdownItemClass(isActive)}
                  >
                    {isActive ? <Check size={13} aria-hidden="true" /> : <span className="w-[13px] shrink-0" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Desktop: two pill rows */}
      <div className="hidden lg:block space-y-3">

        <div role="group" aria-label="Filter by difficulty" className="flex flex-wrap items-center gap-2 pb-3 border-b border-[hsl(var(--surface-border))]">
          <button type="button" onClick={() => onDifficultyChange(null)} aria-pressed={activeDifficulty === null}
            className={`${activeDifficulty === null ? "pill-active" : "pill-inactive"} px-6`}
          >
            All Levels
          </button>
          {DIFFICULTIES.map((diff) => (
            <button key={diff} type="button" onClick={() => handleDifficultyClick(diff)} aria-pressed={activeDifficulty === diff}
              className={activeDifficulty === diff ? "pill-active" : "pill-inactive"}
            >
              {diff}
            </button>
          ))}
        </div>

        <div role="group" aria-label="Filter by technology" className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onTopicsChange([])} aria-pressed={activeTopics.length === 0}
            className={`${activeTopics.length === 0 ? "pill-active" : "pill-inactive"} px-6`}
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
