export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  difficulty: "Starter" | "Builder" | "Architect";
  tags: string[];
  type: "simulation" | "interactive";
  simulationUrl?: string;
  gitpodUrl?: string;
  completions: number;
  discussions: number;
  status: "live" | "coming_soon";
  estimatedTime: string;
  narrative: string;
  objectives: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "echoes-lost-in-orbit",
    title: "Echoes Lost in Orbit",
    subtitle: "A deep space signal has gone silent. Can you restore the telemetry pipeline?",
    difficulty: "Starter",
    tags: ["Kubernetes", "Observability", "Prometheus"],
    type: "interactive",
    gitpodUrl: "https://gitpod.io/#https://github.com/open-ecosystem/echoes-lost-in-orbit",
    completions: 142,
    discussions: 23,
    status: "live",
    estimatedTime: "45 min",
    narrative: "Year 2187. The deep space relay station Meridian-7 has gone dark. Telemetry from three orbital probes stopped streaming 47 minutes ago. Your mission: diagnose the broken observability pipeline, restore Prometheus scraping, and bring the signal home before the orbital window closes.",
    objectives: [
      "Identify why Prometheus targets are showing as DOWN",
      "Fix the broken service discovery configuration",
      "Restore metric flow and verify in Grafana dashboard",
      "Complete within the 60-minute orbital window"
    ]
  },
  {
    id: "the-silent-deploy",
    title: "The Silent Deploy",
    subtitle: "A deployment went out. Nothing broke. Nothing works either.",
    difficulty: "Builder",
    tags: ["GitOps", "ArgoCD", "Helm"],
    type: "interactive",
    gitpodUrl: "https://gitpod.io/#https://github.com/open-ecosystem/the-silent-deploy",
    completions: 87,
    discussions: 15,
    status: "live",
    estimatedTime: "60 min",
    narrative: "The CI pipeline says green. ArgoCD says synced. But the application is serving stale content from three releases ago. Something in the GitOps chain is lying to you. Trace the deployment path from commit to cluster and find where the truth diverges.",
    objectives: [
      "Audit the Helm chart values across environments",
      "Identify the ArgoCD sync discrepancy",
      "Fix the deployment pipeline to reflect actual state",
      "Verify the correct image tag is running in the cluster"
    ]
  },
  {
    id: "phantom-latency",
    title: "Phantom Latency",
    subtitle: "P99 latency spiked 10x. All dashboards say everything is fine.",
    difficulty: "Architect",
    tags: ["Distributed Tracing", "OpenTelemetry", "Jaeger"],
    type: "simulation",
    simulationUrl: "https://opensource-europe.org/challenges/phantom",
    completions: 34,
    discussions: 41,
    status: "live",
    estimatedTime: "90 min",
    narrative: "Users are complaining. The CEO is asking questions. But every dashboard, every metric, every health check says the system is perfectly healthy. The latency is real — but it's invisible to your tooling. Something is happening between the spans.",
    objectives: [
      "Deploy OpenTelemetry collector with proper sampling",
      "Identify the uninstrumented service causing the gap",
      "Trace the actual request path through all 7 microservices",
      "Prove the root cause with distributed trace evidence"
    ]
  },
  {
    id: "the-config-drift",
    title: "The Config Drift",
    subtitle: "Three clusters. Three different realities. One source of truth — supposedly.",
    difficulty: "Builder",
    tags: ["IaC", "Terraform", "Policy"],
    type: "interactive",
    gitpodUrl: "https://gitpod.io/#https://github.com/open-ecosystem/the-config-drift",
    completions: 63,
    discussions: 19,
    status: "live",
    estimatedTime: "60 min",
    narrative: "Your platform team manages three Kubernetes clusters that should be identical. They aren't. Security just flagged that one cluster has a wildcard ingress, another has no network policies, and the third has resource limits set to infinity. Find the drift before the auditors do.",
    objectives: [
      "Run a drift detection scan across all three clusters",
      "Identify which Terraform state files have diverged",
      "Implement OPA policies to prevent future drift",
      "Reconcile all clusters to the golden configuration"
    ]
  },
  {
    id: "zero-day-morning",
    title: "Zero-Day Morning",
    subtitle: "A CVE dropped at 3am. Your containers are affected. All of them.",
    difficulty: "Starter",
    tags: ["Security", "Container Scanning", "SBOM"],
    type: "interactive",
    gitpodUrl: "https://gitpod.io/#https://github.com/open-ecosystem/zero-day-morning",
    completions: 198,
    discussions: 32,
    status: "live",
    estimatedTime: "40 min",
    narrative: "You wake up to a critical CVE notification. The vulnerability affects a base image used across your entire fleet — 47 services, 12 teams, hundreds of running containers. You need to assess the blast radius, patch the critical paths, and prove compliance — before the morning standup.",
    objectives: [
      "Generate SBOMs for all affected container images",
      "Identify which running services are vulnerable",
      "Patch the base image and trigger rebuilds",
      "Verify no vulnerable containers remain in production"
    ]
  },
  {
    id: "the-scaling-paradox",
    title: "The Scaling Paradox",
    subtitle: "More replicas, more problems. Autoscaling is making things worse.",
    difficulty: "Architect",
    tags: ["HPA", "Kubernetes", "Load Testing"],
    type: "simulation",
    simulationUrl: "https://opensource-europe.org/challenges/scaling",
    completions: 21,
    discussions: 38,
    status: "coming_soon",
    estimatedTime: "90 min",
    narrative: "The Horizontal Pod Autoscaler is doing exactly what you told it to. Unfortunately, what you told it is wrong. Every scale-up event triggers a cascade that makes latency worse, which triggers more scaling, which makes things even worse. Break the feedback loop.",
    objectives: [
      "Analyze the current HPA configuration and metrics",
      "Identify the metric that's causing the scaling feedback loop",
      "Redesign the autoscaling strategy with appropriate thresholds",
      "Load test to prove stability under the original traffic pattern"
    ]
  }
];
