export interface AdventureLevel {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  learnings: string[];
  codespacesUrl: string;
}

export interface Adventure {
  id: string;
  title: string;
  month: string;
  story: string;
  tags: string[];
  forks: number;
  status: "live" | "coming_soon";
  levels: AdventureLevel[];
}

export const ADVENTURES: Adventure[] = [
  {
    id: "echoes-lost-in-orbit",
    title: "Echoes Lost in Orbit",
    month: "DEC 2025",
    story: "Restore interstellar communications by fixing broken GitOps setups, progressive delivery systems, and observability pipelines across three galactic missions.",
    tags: ["Argo CD", "Argo Rollouts", "OpenTelemetry", "Jaeger", "PromQL"],
    forks: 54,
    status: "live",
    levels: [
      {
        id: "beginner",
        name: "Broken Echoes",
        difficulty: "Beginner",
        learnings: ["Debug GitOps flows with Argo CD", "ApplicationSet templating & pitfalls", "Environment isolation & namespaces", "Sync policies: automated, prune & self-heal"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      },
      {
        id: "intermediate",
        name: "The Silent Canary",
        difficulty: "Intermediate",
        learnings: ["Progressive delivery with Argo Rollouts", "Canary deployments & automated analysis", "Write PromQL queries for health validation", "Kube-state-metrics for deployment decisions"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      },
      {
        id: "expert",
        name: "Hyperspace Operations & Transport",
        difficulty: "Expert",
        learnings: ["Configure OpenTelemetry Collector pipelines", "Spanmetrics connector (traces → metrics)", "Detect idle canaries with traffic validation", "Distributed tracing with Jaeger"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      }
    ]
  },
  {
    id: "building-cloudhaven",
    title: "Building CloudHaven",
    month: "JAN 2026",
    story: "Join the Infrastructure Guild and modernize CloudHaven's infrastructure from manual provisioning to a self-service platform using Infrastructure as Code.",
    tags: ["OpenTofu", "Terraform", "GitHub Actions", "Trivy", "TDD"],
    forks: 54,
    status: "live",
    levels: [
      {
        id: "beginner",
        name: "The Foundation Stones",
        difficulty: "Beginner",
        learnings: ["Infrastructure as Code with OpenTofu", "Remote state management with GCS backend", "Dynamic & conditional resources"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      },
      {
        id: "intermediate",
        name: "The Modular Metropolis",
        difficulty: "Intermediate",
        learnings: ["OpenTofu module testing with tofu test", "Test-Driven Development (TDD) workflow", "Input validation with regex"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      },
      {
        id: "expert",
        name: "The Guardian Protocols",
        difficulty: "Expert",
        learnings: ["GitHub Actions for drift detection and plan/apply", "Integration tests with service containers", "Security scanning with Trivy"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      }
    ]
  },
  {
    id: "the-ai-observatory",
    title: "The AI Observatory",
    month: "FEB 2026",
    story: "Investigate a mysterious bandwidth anomaly at a remote research station by instrumenting its AI system with OpenTelemetry.",
    tags: ["OpenTelemetry", "OpenLLMetry", "Jaeger", "Prometheus", "Python"],
    forks: 54,
    status: "live",
    levels: [
      {
        id: "beginner",
        name: "Calibrating the Lens",
        difficulty: "Beginner",
        learnings: ["Instrument Python AI apps with OpenLLMetry", "Analyze traces in Jaeger"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      },
      {
        id: "intermediate",
        name: "The Distracted Pilot",
        difficulty: "Intermediate",
        learnings: ["Instrument RAG pipelines with OpenLLMetry", "Create custom OpenTelemetry metrics in Python", "Write PromQL queries & recording rules in Prometheus"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      },
      {
        id: "expert",
        name: "The Noise Filter",
        difficulty: "Expert",
        learnings: ["OpenTelemetry GenAI semantic conventions", "Tail sampling in the OTel Collector"],
        codespacesUrl: "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges?quickstart=1"
      }
    ]
  }
];
