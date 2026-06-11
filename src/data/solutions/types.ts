export type SolutionBlock =
  | { type: "text"; html: string }
  | { type: "code"; language: string; title?: string; code: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "callout"; variant: "tip" | "warning" | "info"; html: string };

export type SolutionStep = {
  id: string;
  title: string;
  intro?: string;
  body: SolutionBlock[];
  takeaways?: string[];
  furtherReading?: Array<{ title: string; url: string }>;
};

export type Solution = {
  adventureId: string;
  levelId: string;
  /** Page title, e.g. "Beginner Solution: Broken Echoes" */
  title: string;
  /** Person who wrote the walkthrough (may differ from the challenge builder) */
  contributor?: { name: string; url?: string };
  /** Spoiler note rendered at the top of the page */
  spoilerWarning?: string;
  /** Intro paragraph(s) rendered before the context card */
  intro?: string;
  /** Optional context section explaining setup or tooling */
  context?: {
    title: string;
    body: SolutionBlock[];
  };
  steps: SolutionStep[];
  /** Final corrected config or code shown as a summary card */
  completeSolution?: {
    title?: string;
    description?: string;
    language: string;
    code: string;
  };
  /** Narrative closing section rendered after the complete solution */
  outro?: {
    heading: string;
    html: string;
  };
};
