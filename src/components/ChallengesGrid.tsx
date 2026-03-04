import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ADVENTURES, Adventure } from "@/data/adventures";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ChevronDown, X, Layers } from "lucide-react";

const difficulties = ["All", "Beginner", "Intermediate", "Expert"] as const;
const categories = ["All", "Technical", "Non-Technical"] as const;

const difficultyColor: Record<string, string> = {
  Beginner: "text-primary border-primary/30 bg-primary/10",
  Intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Expert: "text-red-400 border-red-400/30 bg-red-400/10",
};

const difficultyDot: Record<string, string> = {
  Beginner: "bg-primary",
  Intermediate: "bg-yellow-400",
  Expert: "bg-red-400",
};

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();

/** Card for a single level */
const LevelCard = ({ level, adventure }: { level: Adventure["levels"][0]; adventure: Adventure }) => {
  const linkTo = `/adventures/${adventure.id}/levels/${level.id}`;
  return (
  <Link
    to={linkTo}
    key={`${adventure.id}-${level.id}`}
    className="group relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
  >
    <span className="inline-block mb-3 rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--text-faint))] uppercase tracking-wider">
      {adventure.month}
    </span>

    <div className="mb-3">
      <span className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${difficultyColor[level.difficulty]}`}>
        <span className={`h-2 w-2 rounded-full ${difficultyDot[level.difficulty]}`} />
        {level.difficulty}
      </span>
    </div>

    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
      {level.name}
    </h3>
    <p className="mt-1 text-xs text-muted-foreground font-mono">{adventure.title}</p>

    <ul className="mt-4 space-y-1.5">
      {level.learnings.slice(0, 3).map((learning, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span className="line-clamp-1">{learning}</span>
        </li>
      ))}
      {level.learnings.length > 3 && (
        <li className="text-xs text-[hsl(var(--text-faint))] pl-3">+{level.learnings.length - 3} more</li>
      )}
    </ul>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {adventure.tags.slice(0, 3).map((tag) => (
        <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 text-[11px] text-[hsl(var(--text-faint))]">
          {tag}
        </span>
      ))}
    </div>
  </Link>
  );
};

/** Card for a full adventure (all 3 levels) */
const AdventureCard = ({ adventure }: { adventure: Adventure }) => (
  <Link
    to={`/adventures/${adventure.id}`}
    className="group relative rounded-xl border-2 border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="inline-block rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--text-faint))] uppercase tracking-wider">
        {adventure.month}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
        <Layers className="h-3 w-3" />
        3 Levels
      </span>
    </div>

    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
      {adventure.title}
    </h3>
    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{adventure.story}</p>

    {/* Level difficulty pills */}
    <div className="mt-4 flex items-center gap-2">
      {adventure.levels.map((level) => (
        <span
          key={level.id}
          className={`inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${difficultyColor[level.difficulty]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${difficultyDot[level.difficulty]}`} />
          {level.difficulty}
        </span>
      ))}
    </div>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {adventure.tags.slice(0, 4).map((tag) => (
        <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 text-[11px] text-[hsl(var(--text-faint))]">
          {tag}
        </span>
      ))}
    </div>
  </Link>
);

export const ChallengesGrid = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [viewMode, setViewMode] = useState<"challenges" | "adventures">("challenges");
  const [filter, setFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const allLevels = ADVENTURES.flatMap((adventure) =>
    adventure.levels.map((level) => ({ ...level, adventure }))
  );

  const filteredLevels = allLevels
    .filter((l) => filter === "All" || l.difficulty === filter)
    .filter((l) => selectedTags.length === 0 || selectedTags.some((t) => l.adventure.tags.includes(t)))
    .filter((l) => categoryFilter === "All" || l.adventure.category === categoryFilter.toLowerCase());

  const filteredAdventures = ADVENTURES
    .filter((a) => filter === "All" || a.levels.some((l) => l.difficulty === filter))
    .filter((a) => selectedTags.length === 0 || selectedTags.some((t) => a.tags.includes(t)))
    .filter((a) => categoryFilter === "All" || a.category === categoryFilter.toLowerCase());

  return (
    <section id="challenges" ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Challenges</span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-6 text-3xl font-bold text-foreground md:text-4xl">
              Choose your challenge
            </h2>

            {/* Filters */}
            <div className="animate-fade-up-delay-1 mb-8 flex flex-wrap items-center gap-2">
              {/* View mode toggle */}
              {(["challenges", "adventures"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                    viewMode === mode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-[hsl(var(--surface-border))] text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {mode === "challenges" ? "Challenges" : "Adventures"}
                </button>
              ))}

              <div className="mx-1 h-6 w-px bg-[hsl(var(--surface-border))]" />
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                    filter === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-[hsl(var(--surface-border))] text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {d}
                  <span className="ml-2 text-[hsl(var(--text-faint))]">
                    {d === "All" ? allLevels.length : allLevels.filter((l) => l.difficulty === d).length}
                  </span>
                </button>
              ))}

              <div className="mx-1 h-6 w-px bg-[hsl(var(--surface-border))]" />

              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                    categoryFilter === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-[hsl(var(--surface-border))] text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}

              <div className="mx-1 h-6 w-px bg-[hsl(var(--surface-border))]" />

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setTagDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg border border-[hsl(var(--surface-border))] px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                >
                  Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {tagDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-2 shadow-xl">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-[hsl(var(--surface-border))] hover:text-foreground"
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                          selectedTags.includes(tag) ? "border-primary bg-primary text-primary-foreground" : "border-[hsl(var(--surface-border))]"
                        }`}>
                          {selectedTags.includes(tag) && "✓"}
                        </span>
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20"
                >
                  {tag}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Cards based on view mode */}
            <div className="animate-fade-up-delay-2 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {viewMode === "adventures"
                ? filteredAdventures.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} />
                  ))
                : filteredLevels.map((level) => (
                    <LevelCard key={`${level.adventure.id}-${level.id}`} level={level} adventure={level.adventure} />
                  ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
