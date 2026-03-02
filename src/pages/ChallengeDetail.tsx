import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CHALLENGES } from "@/data/challenges";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const GitpodEnvironment = ({ challenge }: { challenge: typeof CHALLENGES[0] }) => {
  const features = [
    { title: "VS Code in browser", desc: "Full editor with extensions" },
    { title: "Pre-broken environment", desc: "Kubernetes cluster with the challenge scenario pre-loaded" },
    { title: "Built-in validation", desc: "Run the verify script to check your solution" },
    { title: "4 vCPUs · 16 GB RAM", desc: "Real compute, not a sandbox" },
  ];

  return (
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary mx-auto mb-5 text-2xl">
        ⟐
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Cloud Development Environment</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
        Full VS Code editor with terminal, kubectl, and all tools pre-installed. 4 vCPUs, 16 GB RAM — powered by Gitpod.
      </p>
      <a
        href={challenge.gitpodUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all hover:brightness-110"
      >
        Open in Gitpod →
      </a>
      <p className="mt-4 text-xs text-[hsl(var(--text-faint))] font-mono">
        Requires a free GitHub account · Environment auto-provisions in ~30 seconds
      </p>

      <div className="mt-10 border-t border-[hsl(var(--surface-border))] pt-8">
        <h4 className="font-mono text-xs uppercase tracking-widest text-primary mb-5">What you'll get</h4>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-[hsl(var(--surface-border))] bg-background p-4 text-left">
              <span className="text-sm font-medium text-foreground">{f.title}</span>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimulationEnvironment = ({ challenge }: { challenge: typeof CHALLENGES[0] }) => (
  <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] overflow-hidden">
    <div className="flex items-center gap-2 border-b border-[hsl(var(--surface-border))] px-4 py-2">
      <div className="flex gap-1.5">
        <span className="h-3 w-3 rounded-full bg-red-500/60" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
        <span className="h-3 w-3 rounded-full bg-green-500/60" />
      </div>
      <span className="ml-2 flex-1 rounded-md bg-secondary/50 px-3 py-1 font-mono text-xs text-muted-foreground truncate">
        {challenge.simulationUrl}
      </span>
    </div>
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 mx-auto mb-5 text-2xl">
        ⚡
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Browser Simulation</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        This challenge runs as an interactive simulation directly in your browser.
      </p>
      <a
        href={challenge.simulationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-8 py-4 text-base font-medium text-white transition-all hover:brightness-110"
      >
        Launch Simulation →
      </a>
    </div>
  </div>
);

const EnvironmentTab = ({ challenge }: { challenge: typeof CHALLENGES[0] }) => {
  if (challenge.type === "interactive") {
    return <GitpodEnvironment challenge={challenge} />;
  }
  return <SimulationEnvironment challenge={challenge} />;
};

const DiscussionTab = () => {
  const comments = [
    { initials: "AK", color: "bg-primary/20 text-primary", name: "alexk", time: "3 hours ago", likes: 12, text: "The key insight is that the service discovery regex was using a capturing group instead of a non-capturing one. Once I fixed that, all targets came back online." },
    { initials: "JM", color: "bg-purple-500/20 text-purple-400", name: "jmartinez", time: "8 hours ago", likes: 7, text: "I took a different approach — instead of fixing the regex, I rewrote the relabeling rules to use static_configs as a fallback. Less elegant but it got the job done quickly." },
    { initials: "PL", color: "bg-yellow-500/20 text-yellow-400", name: "plee", time: "1 day ago", likes: 19, text: "Pro tip: always check `kubectl get servicemonitors -A` first. The ServiceMonitor selector labels were mismatched, which is why Prometheus couldn't find the targets at all." },
  ];

  return (
    <div className="space-y-4">
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
      <p className="text-xs text-[hsl(var(--text-faint))] mt-2 font-mono">
        // Implementation note: Replace with Discourse Embedding SDK
      </p>
    </div>
  );
};

const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const challenge = CHALLENGES.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState<"environment" | "discussion">("environment");

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Challenge not found.</p>
      </div>
    );
  }

  const difficultyColor: Record<string, string> = {
    Starter: "text-primary border-primary/30 bg-primary/10",
    Builder: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    Architect: "text-red-400 border-red-400/30 bg-red-400/10",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${difficultyColor[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 font-mono text-[10px] ${challenge.type === "simulation" ? "border-purple-400/30 bg-purple-400/10 text-purple-400" : "border-primary/30 bg-primary/10 text-primary"}`}>
              {challenge.type === "simulation" ? "⚡ Simulation" : "▶ Interactive"}
            </span>
            {challenge.status === "live" && (
              <span className="inline-flex items-center gap-1 rounded-[5px] border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground ml-auto">{challenge.estimatedTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{challenge.title}</h1>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-8">{challenge.narrative}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {challenge.objectives.map((obj, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-4">
                <span className="font-mono text-xs text-primary mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm text-muted-foreground">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[hsl(var(--surface-border))] mb-8">
          {(["environment", "discussion"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 font-mono text-sm capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "environment" ? <EnvironmentTab challenge={challenge} /> : <DiscussionTab />}
      </div>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
