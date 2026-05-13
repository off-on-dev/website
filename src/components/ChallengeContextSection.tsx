import type { JSX } from "react";
import { COMMUNITY_DISPLAY_NAME } from "@/data/constants";

type ToolboxItem = { name: string; description?: string; url?: string };

type ChallengeContextSectionProps = {
  intro?: string[];
  backstory?: string[];
  architecture?: string[];
  architectureDiagram?: string;
  objective?: string[];
  toolbox?: ToolboxItem[];
  howToPlay?: string[];
  codespacesUrl?: string;
  verificationUrl?: string;
  discussionUrl?: string;
};

export const ChallengeContextSection = ({
  intro,
  backstory,
  architecture,
  architectureDiagram,
  objective,
  toolbox,
  howToPlay,
  codespacesUrl,
  verificationUrl,
  discussionUrl,
}: ChallengeContextSectionProps): JSX.Element | null => {
  if (!intro?.length && !backstory?.length && !architecture?.length && !architectureDiagram && !objective?.length && !toolbox?.length && !howToPlay?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {intro && intro.length > 0 && (
        <div className="md:col-span-2 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-6 py-5">
          <span className="section-label text-[hsl(var(--text-faint))] text-xs uppercase tracking-widest block mb-3">challenge</span>
          <div className="space-y-3">
            {intro.map((para, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      )}
      {backstory && backstory.length > 0 && (
        <div className="md:col-span-2 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-6 py-5">
          <span className="section-label text-[hsl(var(--text-faint))] text-xs uppercase tracking-widest block mb-3">backstory</span>
          <div className="space-y-3">
            {backstory.map((para, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed italic">{para}</p>
            ))}
          </div>
        </div>
      )}
      {(architecture && architecture.length > 0 || architectureDiagram) && (
        <div className="md:col-span-2 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-6 py-5">
          <span className="section-label text-[hsl(var(--text-faint))] text-xs uppercase tracking-widest block mb-3">architecture</span>
          {architectureDiagram && (
            <img
              src={architectureDiagram}
              alt={architecture ? architecture.join(" ") : "Architecture diagram"}
              loading="lazy"
              className="w-full rounded-lg mb-3"
            />
          )}
          {!architectureDiagram && architecture && architecture.length > 0 && (
            <div className="space-y-3">
              {architecture.map((para, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
              ))}
            </div>
          )}
        </div>
      )}
      {howToPlay && howToPlay.length > 0 && (
        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 md:col-span-2">
          <h2 className="text-base font-semibold text-foreground mb-3">How to Play</h2>
          <ol role="list" className="space-y-3 list-none">
            {codespacesUrl && (
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span aria-hidden="true" className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[hsl(var(--surface-border))] text-xs font-mono text-[hsl(var(--text-faint))]">1</span>
                <span>
                  <a
                    href={codespacesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="docs-ext-link font-medium underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                  >
                    Open in GitHub Codespaces<span className="sr-only"> (opens in new tab)</span>
                  </a>
                  . The devcontainer is pre-configured and starts automatically. GitHub will fork the repo to your account when you make your first commit.
                </span>
              </li>
            )}
            {howToPlay.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span aria-hidden="true" className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[hsl(var(--surface-border))] text-xs font-mono text-[hsl(var(--text-faint))]">
                  {codespacesUrl ? index + 2 : index + 1}
                </span>
                {step}
              </li>
            ))}
            {discussionUrl && (
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span aria-hidden="true" className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[hsl(var(--surface-border))] text-xs font-mono text-[hsl(var(--text-faint))]">
                  {codespacesUrl ? (howToPlay?.length ?? 0) + 2 : (howToPlay?.length ?? 0) + 1}
                </span>
                <span>
                  Share your solutions and questions in the{" "}
                  <a
                    href={discussionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="docs-ext-link font-medium underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                  >
                    challenge thread<span className="sr-only"> (opens in new tab)</span>
                  </a>
                  {" "}on {COMMUNITY_DISPLAY_NAME}.
                </span>
              </li>
            )}
          </ol>
          {verificationUrl && (
            <p className="mt-4 pt-4 border-t border-[hsl(var(--surface-border))] text-xs text-[hsl(var(--text-faint))]">
              Need step-by-step verification instructions?{" "}
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="docs-ext-link underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
              >
                Read the Verification Guide<span className="sr-only"> (opens in new tab)</span>
              </a>
              .
            </p>
          )}
        </div>
      )}

      {objective && objective.length > 0 && (
        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Objective</h2>
          <ul className="space-y-2">
            {objective.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {toolbox && toolbox.length > 0 && (
        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Toolbox</h2>
          <ul className="space-y-2">
            {toolbox.map((item) => (
              <li key={item.name} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>
                  {item.url ? (
                    <>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="docs-ext-link font-medium underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                      >
                        {item.name}<span className="sr-only"> (opens in new tab)</span>
                      </a>
                      {item.description && <>: {item.description}</>}
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-foreground">{item.name}</span>
                      {item.description && <>: {item.description}</>}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
