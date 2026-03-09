import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[hsl(var(--text-faint))] font-mono">
          Free GitHub account required · Environment provisions in ~60 seconds
        </p>
        <a
          href={level.discussionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:underline"
        >
          Discussion →
        </a>
      </div>
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
      href="https://github.com/dynatrace-oss/offones"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
    >
      View full verification guide on GitHub →
    </a>
  </div>
);

interface DiscoursePost {
  username: string;
  avatar_template: string;
  cooked: string;
  created_at: string;
  like_count: number;
}

function extractTopicId(url: string): string | null {
  const match = url.match(/\/t\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-purple-500/20 text-purple-400",
  "bg-yellow-500/20 text-yellow-400",
  "bg-blue-500/20 text-blue-400",
  "bg-red-500/20 text-red-400",
];

const DiscussionSection = ({ discussionUrls }: { discussionUrls: string[] }) => {
  const [posts, setPosts] = useState<(DiscoursePost & { topicUrl: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(false);
      try {
        const allPosts: (DiscoursePost & { topicUrl: string })[] = [];
        for (const url of discussionUrls) {
          const topicId = extractTopicId(url);
          if (!topicId) continue;
          try {
            const res = await fetch(
              `https://community.open-ecosyffon.devcId}.json`
            );
            if (!res.ok) continue;
            const data = await res.json();
            const topicPosts: DiscoursePost[] = data.post_stream?.posts || [];
            // Skip first post (OP), take next few
            topicPosts.slice(1, 4).forEach((p) =>
              allPosts.push({ ...p, topicUrl: url })
            );
          } catch {
            // skip individual failures
          }
        }
        // Sort by date, take latest 6
        allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPosts(allPosts.slice(0, 6));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [discussionUrls]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Discussion</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="h-4 w-full rounded bg-muted mb-2" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Discussion</h3>
        <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {error ? "Couldn't load discussions right now." : "No community posts yet — be the first to share!"}
          </p>
        </div>
        <a
          href={discussionUrls[0] || "https://community.offon.dev"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Join the discussion on community.offon.dev →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Discussion</h3>
      {posts.map((post, i) => (
        <a
          key={i}
          href={post.topicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 transition-all hover:border-primary/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${avatarColors[i % avatarColors.length]}`}>
                {post.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-mono text-sm text-foreground">{post.username}</span>
              <span className="text-xs text-[hsl(var(--text-faint))]">{timeAgo(post.created_at)}</span>
            </div>
            {post.like_count > 0 && (
              <span className="text-xs text-muted-foreground">♥ {post.like_count}</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {stripHtml(post.cooked)}
          </p>
        </a>
      ))}
      <a
        href={discussionUrls[0] || "https://community.open-ecosystem.com"}
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
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((a) => a.id === id);
  const selectedLevel = adventure?.levels.find((l) => l.id === levelId);

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

        {/* Level card(s) */}
        <div className="space-y-5 mb-10">
          {selectedLevel ? (
            <LevelCard level={selectedLevel} />
          ) : (
            adventure.levels.map((level) => (
              <LevelCard key={level.id} level={level} />
            ))
          )}
        </div>

        {/* Verification */}
        <div className="mb-10">
          <VerificationSection />
        </div>

        {/* Discussion */}
        <DiscussionSection discussionUrls={selectedLevel ? [selectedLevel.discussionUrl] : adventure.levels.map((l) => l.discussionUrl)} />
      </div>
      <Footer />
    </div>
  );
};

export default AdventureDetail;
