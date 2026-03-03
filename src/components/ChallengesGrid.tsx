import { useState } from "react";
import { Link } from "react-router-dom";
import { ADVENTURES } from "@/data/adventures";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const difficulties = ["All", "Beginner", "Intermediate", "Expert"] as const;

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

export const ChallengesGrid = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [filter, setFilter] = useState<string>("All");

  const allLevels = ADVENTURES.flatMap((adventure) =>
    adventure.levels.map((level) => ({ ...level, adventure }))
  );

  const filtered = filter === "All" ? allLevels : allLevels.filter((l) => l.difficulty === filter);

  return (
    <section id="challenges" ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Adventures</span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-6 text-3xl font-bold text-foreground md:text-4xl">
              Choose your adventure
            </h2>

            {/* Difficulty filter */}
            <div className="animate-fade-up-delay-1 mb-8 flex flex-wrap gap-2">
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
            </div>

            {/* Level cards */}
            <div className="animate-fade-up-delay-2 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((level) => (
                <Link
                  to={`/adventures/${level.adventure.id}`}
                  key={`${level.adventure.id}-${level.id}`}
                  className="group relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Adventure context */}
                  <span className="inline-block mb-3 rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--text-faint))] uppercase tracking-wider">
                    {level.adventure.month}
                  </span>

                  {/* Difficulty badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${difficultyColor[level.difficulty]}`}>
                      <span className={`h-2 w-2 rounded-full ${difficultyDot[level.difficulty]}`} />
                      {level.difficulty}
                    </span>
                  </div>

                  {/* Level name */}
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {level.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">{level.adventure.title}</p>

                  {/* Learnings */}
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

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {level.adventure.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 text-[11px] text-[hsl(var(--text-faint))]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
