import { Link } from "react-router-dom";
import { ADVENTURES, Adventure } from "@/data/adventures";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Layers } from "lucide-react";

const difficultyColor: Record<string, string> = {
  Beginner: "badge-difficulty badge-beginner",
  Intermediate: "badge-difficulty badge-intermediate",
  Expert: "badge-difficulty badge-expert",
};

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();

/** Card for a full adventure (all 3 levels) */
const AdventureCard = ({ adventure }: { adventure: Adventure }) => (
  <Link
    to={`/adventures/${adventure.id}`}
    className="group card-glow relative rounded-xl border-2 border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] block"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="inline-block rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--text-faint))] uppercase tracking-wider">
        {adventure.month}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary">
        <Layers className="h-3 w-3" />
        3 Levels
      </span>
    </div>

    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
      {adventure.title}
    </h3>
    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{adventure.story}</p>

    {/* Level difficulty pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
      {adventure.levels.map((level) => (
        <span key={level.id} className={difficultyColor[level.difficulty]}>
          {level.difficulty}
        </span>
      ))}
    </div>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {adventure.tags.slice(0, 4).map((tag) => (
        <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 text-[13px] text-[hsl(var(--text-faint))]">
          {tag}
        </span>
      ))}
    </div>
  </Link>
);

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
            <h2 className="animate-fade-up-delay-1 mb-6 text-3xl font-bold text-primary md:text-4xl">
              Choose your adventure
            </h2>

            {/* Tag links */}
            <div className="animate-fade-up-delay-1 mb-8 flex flex-wrap items-center gap-2">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  to={`/topics/${encodeURIComponent(tag)}`}
                  className="pill-inactive"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Adventure cards */}
            <div className="animate-fade-up-delay-2 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ADVENTURES.map((adventure) => (
                <AdventureCard key={adventure.id} adventure={adventure} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
