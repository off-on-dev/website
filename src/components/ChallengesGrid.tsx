import { Link } from "react-router-dom";
import { ADVENTURES } from "@/data/adventures";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const difficultyColor: Record<string, string> = {
  Beginner: "text-primary border-primary/30 bg-primary/10",
  Intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Expert: "text-red-400 border-red-400/30 bg-red-400/10",
};

export const ChallengesGrid = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="challenges" ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Adventures</span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-10 text-3xl font-bold text-foreground md:text-4xl">
              Choose your adventure
            </h2>
            <div className="animate-fade-up-delay-2 grid gap-5 md:grid-cols-3">
              {ADVENTURES.map((adventure) => (
                <Link
                  to={`/adventures/${adventure.id}`}
                  key={adventure.id}
                  className="group relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                >
                  <span className="inline-block mb-4 rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--text-faint))] uppercase tracking-wider">
                    {adventure.month}
                  </span>

                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {adventure.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{adventure.story}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {adventure.levels.map((level) => (
                      <span
                        key={level.id}
                        className={`inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${difficultyColor[level.difficulty]}`}
                      >
                        {level.difficulty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {adventure.tags.map((tag) => (
                      <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 text-[11px] text-[hsl(var(--text-faint))]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-4 border-t border-[hsl(var(--surface-border))] pt-4 text-xs text-muted-foreground font-mono">
                    <span>{adventure.forks} forks</span>
                    <span>3 levels</span>
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
