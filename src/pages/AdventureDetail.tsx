import { useParams, Link } from "react-router-dom";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const difficultyIndicator: Record<string, { color: string; dot: string }> = {
  Beginner: { color: "text-primary border-primary/30 bg-primary/10", dot: "bg-primary" },
  Intermediate: { color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10", dot: "bg-yellow-400" },
  Expert: { color: "text-red-400 border-red-400/30 bg-red-400/10", dot: "bg-red-400" },
};

const LevelCard = ({ level }: { level: typeof ADVENTURES[0]["levels"][0] }) => {
  const indicator = difficultyIndicator[level.difficulty];

  return (
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${indicator.color}`}>
          <span className={`h-2 w-2 rounded-full ${indicator.dot}`} />
          {level.difficulty}
        </span>
        <h3 className="text-lg font-semibold text-foreground">{level.name}</h3>
      </div>

      <div className="mb-6">
        <h4 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Key Learnings</h4>
        <ul className="space-y-2">
          {level.learnings.map((learning, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {learning}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={level.codespacesUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
      >
        Open in GitHub Codespaces →
      </a>
      <p className="mt-3 text-xs text-[hsl(var(--text-faint))] font-mono">
        Free GitHub account required · Environment provisions in ~60 seconds
      </p>
    </div>
  );
};

const VerificationSection = () => (
  <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
    <h3 className="text-lg font-semibold text-foreground mb-4">Verification</h3>
    <p className="text-sm text-muted-foreground mb-6">
      Each level uses a two-step verification process to validate your solution.
    </p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-background p-4">
        <span className="font-mono text-xs text-primary">Step 1</span>
        <p className="mt-2 text-sm text-muted-foreground">
          Run the smoke test locally in your Codespace for quick validation
        </p>
      </div>
      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-background p-4">
        <span className="font-mono text-xs text-primary">Step 2</span>
        <p className="mt-2 text-sm text-muted-foreground">
          Push your solution and trigger the GitHub Actions workflow for full verification
        </p>
      </div>
    </div>
    <a
      href="https://github.com/dynatrace-oss/open-ecosystem-challenges"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
    >
      View full verification guide on GitHub →
    </a>
  </div>
);

const DiscussionSection = () => {
  const comments = [
    { initials: "AK", color: "bg-primary/20 text-primary", name: "alexk", time: "3 hours ago", likes: 12, text: "The key insight is that the service discovery regex was using a capturing group instead of a non-capturing one. Once I fixed that, all targets came back online." },
    { initials: "JM", color: "bg-purple-500/20 text-purple-400", name: "jmartinez", time: "8 hours ago", likes: 7, text: "I took a different approach — instead of fixing the regex, I rewrote the relabeling rules to use static_configs as a fallback. Less elegant but it got the job done quickly." },
    { initials: "PL", color: "bg-yellow-500/20 text-yellow-400", name: "plee", time: "1 day ago", likes: 19, text: "Pro tip: always check `kubectl get servicemonitors -A` first. The ServiceMonitor selector labels were mismatched, which is why Prometheus couldn't find the targets at all." },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Discussion</h3>
      {comments.map((c, i) => (
        <div key={i} className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${c.color}`}>
                {c.initials}
              </div>
              <span className="font-mono text-sm text-foreground">{c.name}</span>
              <span className="text-xs text-[hsl(var(--text-faint))]">{c.time}</span>
            </div>
            <span className="text-xs text-muted-foreground">♥ {c.likes}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
        </div>
      ))}
      <a
        href="https://community.open-ecosystem.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
      >
        Join the discussion on community.open-ecosystem.com →
      </a>
    </div>
  );
};

const AdventureDetail = () => {
  const { id } = useParams<{ id: string }>();
  const adventure = ADVENTURES.find((a) => a.id === id);

  if (!adventure) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Adventure not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block mb-4 rounded-[5px] border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--text-faint))] uppercase tracking-wider">
            {adventure.month}
          </span>
          <h1 className="text-4xl font-bold text-foreground mb-4">{adventure.title}</h1>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-6">{adventure.story}</p>
          <div className="flex flex-wrap gap-1.5">
            {adventure.tags.map((tag) => (
              <span key={tag} className="rounded-[5px] border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Level cards */}
        <div className="space-y-5 mb-10">
          {adventure.levels.map((level) => (
            <LevelCard key={level.id} level={level} />
          ))}
        </div>

        {/* Verification */}
        <div className="mb-10">
          <VerificationSection />
        </div>

        {/* Discussion */}
        <DiscussionSection />
      </div>
      <Footer />
    </div>
  );
};

export default AdventureDetail;
