import type { JSX } from "react";

type LivePillProps = { className?: string };

export const LivePill = ({ className }: LivePillProps): JSX.Element => (
  <span className={`inline-flex items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary-foreground${className ? ` ${className}` : ""}`}>
    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-foreground" />
    </span>
    Live
  </span>
);
