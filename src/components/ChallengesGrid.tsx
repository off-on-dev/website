import { useState } from "react";
import { Link } from "react-router-dom";
import { CHALLENGES, type Challenge } from "@/data/challenges";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type Filter = "All" | "Starter" | "Builder" | "Architect";

const DifficultyBadge = ({ difficulty }: { difficulty: Challenge["difficulty"] }) => {
  const colors: Record<string, string> = {
    Starter: "text-primary border-primary/30 bg-primary/10",
    Builder: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    Architect: "text-red-400 border-red-400/30 bg-red-400/10",
  };
  const dots: Record<string, number> = { Starter: 1, Builder: 2, Architect: 3 };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${colors[difficulty]}`}>
      {Array.from({ length: dots[difficulty] }).map((_, i) => (
        <span key={i} className="inline-block h-1 w-1 rounded-full bg-current" />
      ))}
      {difficulty}
    </span>
  );
};

const TypeBadge = ({ type }: { type: Challenge["type"] }) => {
  if (type === "simulation") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[5px] border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 font-mono text-[10px] text-purple-400">
        ⚡ Simulation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[5px] border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
      ▶ Interactive
    </span>
  );
};

export const ChallengesGrid = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const { ref, isVisible } = useScrollAnimation();
  const filters: Filter[] = ["All", "Starter", "Builder", "Architect"];
  const filtered = filter === "All" ? CHALLENGES : CHALLENGES.filter((c) => c.difficulty === filter);

  return (
    <section id="challenges" ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Challenges</span>
            </div>
            <div className="animate-fade-up-delay-1 mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Pick your mission</h2>
              <div className="flex gap-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs transition-all ${
                      filter === f
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground border border-transparent hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="animate-fade-up-delay-2 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))" }}>
              {filtered.map((challenge) => (
                <Link
                  to={`/challenges/${challenge.id}`}
                  key={challenge.id}
                  className="group relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                >
                  {challenge.status === "coming_soon" && (
                    <div className="absolute right-4 top-4 rounded-[5px] bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Coming Soon
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <DifficultyBadge difficulty={challenge.difficulty} />
                    <TypeBadge type={challenge.type} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{challenge.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {challenge.tags.map((tag) => (
                      <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 text-[11px] text-[hsl(var(--text-faint))]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-4 border-t border-[hsl(var(--surface-border))] pt-4 text-xs text-muted-foreground font-mono">
                    <span>{challenge.completions} completions</span>
                    <span>{challenge.discussions} discussions</span>
                    <span className="ml-auto">{challenge.estimatedTime}</span>
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
