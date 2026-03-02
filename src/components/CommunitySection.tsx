import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const posts = [
  { initials: "MK", color: "bg-primary/20 text-primary", name: "mkarev", time: "2h ago", text: "Just solved Echoes Lost in Orbit — the trick was the relabeling config. Prometheus was silently dropping the targets because of a regex mismatch." },
  { initials: "SL", color: "bg-purple-500/20 text-purple-400", name: "srlearn", time: "5h ago", text: "The Silent Deploy drove me crazy for an hour before I realized ArgoCD was syncing to the wrong branch entirely. Subtle but devious 🔥" },
  { initials: "NW", color: "bg-yellow-500/20 text-yellow-400", name: "netwright", time: "1d ago", text: "Has anyone tried the Phantom Latency challenge? The uninstrumented service was the auth sidecar — took me forever to find it." },
];

export const CommunitySection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <div className="animate-fade-up grid gap-12 lg:grid-cols-2">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Community</span>
              <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
                Every challenge has a story behind it
              </h2>
              <p className="mt-4 text-[hsl(var(--text-secondary))] leading-relaxed">
                Discuss approaches, compare solutions, and learn from how others think about the same problem. Every challenge has a dedicated discussion thread on our community forum.
              </p>
              <a
                href="https://community.open-ecosystem.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Visit community.open-ecosystem.com →
              </a>
            </div>
            <div className="flex flex-col gap-4">
              {posts.map((post, i) => (
                <div key={i} className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${post.color}`}>
                      {post.initials}
                    </div>
                    <span className="font-mono text-sm text-foreground">{post.name}</span>
                    <span className="text-xs text-[hsl(var(--text-faint))]">{post.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{post.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
