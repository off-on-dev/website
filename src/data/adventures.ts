import { COMMUNITY_URL } from "@/data/constants";

/** A tool that ships pre-configured inside the level's Codespace. */
export type ToolboxItem = {
  name: string;
  description: string;
  url?: string;
}

/** One step in the Walkthrough section. body is rendered as markdown so it can contain code blocks and links. */
export type WalkthroughStep = {
  title: string;
  body: string;
}

/** Compact card shown beneath the Walkthrough, summarising how to confirm completion. */
export type VerificationInfo = {
  command: string;
  description: string;
}

/** Mock entry in the "Top players" leaderboard inside the CommunitySidebar. */
export type TopPlayer = {
  username: string;
  count: number;
}

/** Placeholder for a level that hasn't shipped yet. Rendered in the "More levels" sidebar card. */
export type UpcomingLevel = {
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
}

/** A single challenge level within an adventure. Difficulty affects visual presentation and prerequisite expectations. */
export type AdventureLevel = {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  learnings: string[];
  codespacesUrl: string;
  discussionUrl: string;
  // Short narrative hook shown directly under the page title.
  hook?: string;
  // Concrete acceptance criteria shown as the "Your task" hero card.
  objectives?: string[];
  // Audience line shown inside the Start CTA card (e.g. "Best for platform engineers, SREs…").
  audience?: string;
  // Long-form narrative shown as a styled scenario block under the hero.
  scenario?: string;
  // Plain-prose architectural context for the challenge.
  architecture?: string;
  // Tools pre-installed in the Codespace, rendered as a row of cards.
  toolbox?: ToolboxItem[];
  // Numbered walkthrough rendered as a vertical stepper.
  howToPlay?: WalkthroughStep[];
  // Verification card rendered as the final section.
  verification?: VerificationInfo;
  // Mock community stats shown in the CommunitySidebar. Real data will replace
  // these once we aggregate certificate posts and cross-challenge contribution.
  solvedCount?: number;
  topPlayers?: TopPlayer[];
}

/** An adventure with multiple difficulty levels, grouped by theme and monthly release. */
export type Adventure = {
  id: string;
  title: string;
  month: string;
  story: string;
  tags: string[];
  levels: AdventureLevel[];
  contributor?: { name: string; url?: string; about?: string };
  // Mock placeholders for levels that haven't shipped yet. Rendered in the
  // "More levels" sidebar card alongside actual sibling levels.
  upcomingLevels?: UpcomingLevel[];
}

const CODESPACES_BASE = "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges";

export const KATHARINA_SICK: NonNullable<Adventure["contributor"]> = {
  name: "Katharina Sick",
  url: "https://ksick.dev/",
  about: "DevRel at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
};

export const ADVENTURES: Adventure[] = [
  {
    id: "echoes-lost-in-orbit",
    title: "Echoes Lost in Orbit",
    month: "DEC 2025",
    story: "Restore interstellar communications by fixing broken GitOps setups, progressive delivery systems, and observability pipelines across three galactic missions.",
    tags: ["Argo CD", "Argo Rollouts", "OpenTelemetry", "Jaeger", "PromQL"],
    contributor: KATHARINA_SICK,
    levels: [
      {
        id: "beginner",
        name: "Broken Echoes",
        difficulty: "Beginner",
        learnings: ["Debug GitOps flows with Argo CD", "ApplicationSet templating & pitfalls", "Environment isolation & namespaces", "Sync policies: automated, prune & self-heal"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_beginner%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-easy-broken-echoes/117/40`
      },
      {
        id: "intermediate",
        name: "The Silent Canary",
        difficulty: "Intermediate",
        learnings: ["Progressive delivery with Argo Rollouts", "Canary deployments & automated analysis", "Write PromQL queries for health validation", "Kube-state-metrics for deployment decisions"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_intermediate%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-intermediate-the-silent-canary/310/8`
      },
      {
        id: "expert",
        name: "Hyperspace Operations & Transport",
        difficulty: "Expert",
        learnings: ["Configure OpenTelemetry Collector pipelines", "Spanmetrics connector (traces to metrics)", "Detect idle canaries with traffic validation", "Distributed tracing with Jaeger"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_expert%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-expert-hyperspace-operations-transport/351/4`
      }
    ]
  },
  {
    id: "building-cloudhaven",
    title: "Building CloudHaven",
    month: "JAN 2026",
    story: "Join the Infrastructure Guild and modernize CloudHaven's infrastructure from manual provisioning to a self-service platform using Infrastructure as Code.",
    tags: ["OpenTofu", "Terraform", "GitHub Actions", "Trivy", "TDD"],
    contributor: KATHARINA_SICK,
    levels: [
      {
        id: "beginner",
        name: "The Foundation Stones",
        difficulty: "Beginner",
        learnings: ["Infrastructure as Code with OpenTofu", "Remote state management with GCS backend", "Dynamic & conditional resources"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_01-beginner%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/practice-infrastructure-as-code-with-zero-setup-adventure-02-beginner/656`
      },
      {
        id: "intermediate",
        name: "The Modular Metropolis",
        difficulty: "Intermediate",
        learnings: ["OpenTofu module testing with tofu test", "Test-Driven Development (TDD) workflow", "Input validation with regex"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_02-intermediate%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/adventure-02-building-cloudhaven-intermediate-the-modular-metropolis/723/10`
      },
      {
        id: "expert",
        name: "The Guardian Protocols",
        difficulty: "Expert",
        learnings: ["GitHub Actions for drift detection and plan/apply", "Integration tests with service containers", "Security scanning with Trivy"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_03-expert%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/adventure-02-building-cloudhaven-expert-the-guardian-protocols/782/8`
      }
    ]
  },
  {
    id: "the-ai-observatory",
    title: "The AI Observatory",
    month: "FEB 2026",
    story: "Investigate a mysterious bandwidth anomaly at a remote research station by instrumenting its AI system with OpenTelemetry.",
    tags: ["OpenTelemetry", "OpenLLMetry", "Jaeger", "Prometheus", "Python"],
    contributor: KATHARINA_SICK,
    levels: [
      {
        id: "beginner",
        name: "Calibrating the Lens",
        difficulty: "Beginner",
        learnings: ["Instrument Python AI apps with OpenLLMetry", "Analyze traces in Jaeger"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F03-the-ai-observatory_01-beginner%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/instrument-your-first-llm-adventure-03-beginner-is-live/865/8`
      },
      {
        id: "intermediate",
        name: "The Distracted Pilot",
        difficulty: "Intermediate",
        learnings: ["Instrument RAG pipelines with OpenLLMetry", "Create custom OpenTelemetry metrics in Python", "Write PromQL queries & recording rules in Prometheus"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F03-the-ai-observatory_02-intermediate%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/instrument-debug-a-rag-pipeline-adventure-03-intermediate-is-live/936/2`
      },
      {
        id: "expert",
        name: "The Noise Filter",
        difficulty: "Expert",
        learnings: ["OpenTelemetry GenAI semantic conventions", "Tail sampling in the OTel Collector"],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F03-the-ai-observatory_03-expert%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/reduce-telemetry-noise-adventure-03-expert-is-live/999/1`
      }
    ]
  },
  {
    id: "blind-by-design",
    title: "Blind by Design",
    month: "MAY 2026",
    story: "Three levels of OpenFeature with flagd as the provider, in a Java + Spring Boot service. Wire the SDK against a flagd sidecar (Beginner), layer evaluation context to target by cohort (Intermediate), then instrument flag evaluations with OpenTelemetry and roll back a misbehaving fractional rollout (Expert). All without redeploying.",
    tags: ["OpenFeature", "flagd", "Spring Boot", "Java", "OpenTelemetry", "Grafana"],
    contributor: {
      name: "Simon Schrottner",
      url: "https://schrottner.at/",
      about: "CNCF Ambassador and maintainer of OpenFeature and JUnit Pioneer. Helps teams release faster and with more confidence through open standards, feature flagging, and the communities that make both possible. A familiar face at KubeCon EU, Devoxx, ContainerDays, and meetups across Europe.",
    },
    levels: [
      {
        id: "beginner",
        name: "Stand up the Lab",
        difficulty: "Beginner",
        learnings: [
          "How an OpenFeature client and provider work together: the SDK is provider-agnostic and the flagd provider plugs in via dependency only",
          "What remote provider means in practice: the SDK calls a separate flag service (flagd) over gRPC, not parsing flags.json itself",
          "What flags.json looks like for flagd (state, variants, defaultVariant)",
          "Why hot-reload of the flag file matters operationally: configuration without redeploy",
        ],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_01-beginner%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/wire-openfeature-flagd-into-a-spring-boot-service-with-zero-setup-adventure-04-beginner/1419`,
      },
      {
        id: "intermediate",
        name: "Outcome by Cohort",
        difficulty: "Intermediate",
        learnings: [
          "How evaluation context works in OpenFeature: passing runtime attributes (user ID, cohort, region) to influence flag resolution",
          "How to configure flagd targeting rules to route specific cohorts to specific flag variants without code changes",
          "Why cohort-based rollouts reduce blast radius: only the targeted segment sees the new behaviour",
          "How to verify targeting is working correctly by inspecting flag evaluation results per context",
        ],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_02-intermediate%2Fdevcontainer.json&quickstart=1`,
        discussionUrl: `${COMMUNITY_URL}/t/outcome-by-cohort-adventure-04-intermediate/1485`,
      },
    ],
  },
];

/** All unique technology tags across all adventures, sorted alphabetically. Shared with filter components; do not re-derive in component files. */
export const ALL_TAGS: string[] = Array.from(
  new Set(ADVENTURES.flatMap((a) => a.tags))
).sort();

export type AdventureContributor = {
  name: string;
  url?: string;
  about?: string;
  adventures: { id: string; title: string }[];
};

/** Community members who contributed an adventure, grouped by person. Derived from ADVENTURES; do not re-derive in components. */
export const ADVENTURE_CONTRIBUTORS: AdventureContributor[] = Object.values(
  ADVENTURES
    .filter((a): a is Adventure & { contributor: NonNullable<Adventure["contributor"]> } => a.contributor !== undefined)
    .reduce<Record<string, AdventureContributor>>((acc, a) => {
      const key = a.contributor.name;
      if (!acc[key]) {
        acc[key] = { name: a.contributor.name, url: a.contributor.url, about: a.contributor.about, adventures: [] };
      }
      acc[key].adventures.push({ id: a.id, title: a.title });
      return acc;
    }, {})
);

/** A level with its parent adventure context, returned when filtering by tag. */
export type RelatedLevel = {
  level: AdventureLevel;
  adventureId: string;
  adventureTitle: string;
};

/** Returns all levels across all adventures that include the given technology tag. */
export const getLevelsByTag = (tag: string): RelatedLevel[] =>
  ADVENTURES.filter((adventure) => adventure.tags.includes(tag)).flatMap((adventure) =>
    adventure.levels.map((level) => ({
      level,
      adventureId: adventure.id,
      adventureTitle: adventure.title,
    }))
  );
