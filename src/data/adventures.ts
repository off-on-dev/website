import { COMMUNITY_URL } from "@/data/constants";

/** A tool that ships pre-configured inside the level's Codespace. */
export type ToolboxItem = {
  name: string;
  description: string;
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
    ],
  },
  {
    id: "lex-imperfecta",
    title: "Lex Imperfecta",
    month: "JUN 2026",
    story: "The Republic's legal system is in disarray. Workloads run unchecked, required labels go missing, and privileged containers slip through the gates. As a newly appointed Praetor, your mission is to restore order by fixing broken Kyverno policies and enforcing proper admission control.",
    tags: ["Kyverno", "Kubernetes", "Falco", "Policy Reporter", "Argo CD"],
    contributor: KATHARINA_SICK,
    upcomingLevels: [
      { name: "The Senatus Consultum", difficulty: "Intermediate" },
      { name: "The Edict of the Praetor", difficulty: "Expert" },
    ],
    levels: [
      {
        id: "beginner",
        name: "The Twelve Tables",
        difficulty: "Beginner",
        learnings: [
          "How Kyverno ClusterPolicies and validate rules work",
          "The difference between Audit and Enforce enforcement modes",
          "How to write and interpret Kyverno deny conditions",
          "How to use custom label keys to enforce workload identity",
        ],
        codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F00-lex-imperfecta_01-beginner%2Fdevcontainer.json&quickstart=1`,
        // TODO: replace with the real Lex Imperfecta thread once it exists. Pointing at the
        // Echoes Lost in Orbit beginner thread for the demo so the CommunitySidebar populates.
        discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-beginner-broken-echoes/117/37`,
        hook: "Two Kyverno policies guard the gates of the Republic's cluster. Both are misconfigured, and the wrong workloads are slipping through.",
        objectives: [
          "Workloads missing the required label are blocked at admission",
          "Workloads running as privileged containers are blocked at admission",
          "All other workloads deploy and run successfully",
        ],
        audience: "Best for platform engineers, SREs, and developers new to Kubernetes security. No prior Kyverno experience needed.",
        scenario:
          "The Republic's legal scholars have been busy, perhaps too busy. In their haste to codify the Twelve Tables, the foundation of the Republic's legal system, they introduced errors that now threaten the city's order. Workloads that should be blocked are running freely, and workloads that should be allowed are being turned away at the gates. Another scholar left a note: 'I tried to set up policies for privileged containers and required labels, but something's off. I can't figure out why the wrong things are getting through.' Your mission is to investigate the Kyverno policies and restore proper admission control before chaos reaches the city.",
        architecture:
          "The defining principle of the Twelve Tables was that Roman law was enforced at the gates, before a citizen could act, not after the damage was done. Kubernetes admission control works exactly the same way: Kyverno intercepts every request to create or update a workload and checks it against your policies before it reaches the cluster. A misconfigured policy doesn't just fail to enforce. It fails silently, letting non-compliant workloads slip through unnoticed.\n\nYour Codespace comes with a Kubernetes cluster and Kyverno pre-installed. Two `ClusterPolicy` resources are already deployed, but both are misconfigured. The policies live in `manifests/policies/`. You will edit them directly and re-apply with `kubectl`. The pods in `manifests/pods/` are there for reference only.",
        toolbox: [
          { name: "kubectl", description: "Apply and inspect cluster resources" },
          { name: "kyverno CLI", description: "Test and lint policies locally before applying" },
          { name: "k9s", description: "Explore cluster resources in a terminal UI" },
        ],
        howToPlay: [
          {
            title: "Start your challenge",
            body: "Click **Play on GitHub** above. Wait a couple of minutes for the environment to initialize. You can follow progress with `Cmd/Ctrl + Shift + P` → `View Creation Log`.",
          },
          {
            title: "Explore the cluster",
            body: "When your Codespace is ready, four pods are already running, or trying to. Open a terminal and check what's going on:\n\n```bash\nkubectl get pods\n```\n\nInspect why a pod was blocked or admitted:\n\n```bash\nkubectl describe pod <pod-name>\n```\n\nCheck the policies that are in place:\n\n```bash\nkubectl get clusterpolicies\nkubectl get clusterpolicy require-labels -o yaml\nkubectl get clusterpolicy no-privileged-containers -o yaml\n```\n\nYou can also launch **k9s** for a terminal UI view of all cluster resources:\n\n```bash\nk9s\n```",
          },
          {
            title: "Fix the policies",
            body: "Both broken policies are in `manifests/policies/`. Read them carefully. Each has a different kind of misconfiguration.\n\nBefore applying to the cluster, use the `kyverno` CLI to test your policy changes locally against the workload manifests:\n\n```bash\nkyverno apply manifests/policies/require-labels.yaml --resource manifests/pods/missing-labels.yaml\nkyverno apply manifests/policies/no-privileged-containers.yaml --resource manifests/pods/privileged.yaml\n```\n\nOnce you're happy with your changes, re-apply everything:\n\n```bash\nmake apply\n```\n\nHelpful documentation:\n\n- [Kyverno Policy Validation](https://kyverno.io/docs/writing-policies/validate/)\n- [Kyverno Enforcement Modes](https://kyverno.io/docs/writing-policies/policy-settings/#validation-failure-action)\n- [Kyverno Deny Rules](https://kyverno.io/docs/writing-policies/validate/#deny-rules)",
          },
        ],
        verification: {
          command: "./verify.sh",
          description:
            "Once you think you've solved the challenge, run the verification script. If it fails it'll tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
        },
        // Mock data for the demo. Replace with real aggregates once we parse
        // certificate posts and cross-challenge contributor counts.
        solvedCount: 24,
        topPlayers: [
          { username: "KatharinaSick", count: 12 },
          { username: "ams0", count: 9 },
          { username: "theharithsa", count: 7 },
        ],
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
