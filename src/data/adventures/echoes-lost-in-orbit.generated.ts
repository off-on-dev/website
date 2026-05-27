import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const ECHOES_LOST_IN_ORBIT: Adventure = {
  id: "echoes-lost-in-orbit",
  title: "Echoes Lost in Orbit",
  month: "DEC 2025",
  story: "Restore interstellar communications by fixing broken GitOps setups, progressive delivery systems, and observability pipelines across three galactic missions.",
  tags: ["Argo CD", "Argo Rollouts", "OpenTelemetry", "Jaeger", "PromQL"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    about: "DevRel at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
  },
  backstory: [
    "Welcome aboard the GitOps Starliner, a multi-species engineering vessel orbiting the vibrant planet of Polaris-9. Life in this quadrant is wonderfully diverse, from the whispering cloud-dwellers of Nebulon to the rhythmic click-speakers of Crustacea Prime.",
    "Communication between species used to be seamless, thanks to the Echo Server, a universal translator that instantly echoed your words in the listener's native format.",
    "But lately, something's off. Messages are getting scrambled. Some transmissions never arrive. The Echo Server, deployed across the Staging Moonbase and the Production Outpost, is no longer syncing properly. The Argo CD dashboard shows no active deployments, and telemetry is suspiciously quiet.",
    "You've been assigned to restore interstellar communication before the next critical mission.",
  ],
  levels: [
    {
      id: "beginner",
      name: "Broken Echoes",
      difficulty: "Beginner",
      topics: ["Argo CD"],
      learnings: [
        "Debug GitOps flows with Argo CD",
        "ApplicationSet templating & pitfalls",
        "Environment isolation & namespaces",
        "Sync policies: automated, prune & self-heal",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-easy-broken-echoes/117/40`,
      deadline: "10 December 2025 at 09:00 CET",
      intro: [
        "The Echo Server is down across both environments and messages are silent.",
        "Investigate the Argo CD ApplicationSet configuration, spot the templating pitfalls, and restore proper multi-environment delivery to bring communications back online.",
      ],
      backstory: [
        "The Echo Server is misbehaving. Both environments seem to be down, and messages are silent.",
        "Your mission: investigate the Argo CD configuration and restore proper multi-environment delivery.",
      ],
      objective: [
        "See two distinct Applications in the Argo CD dashboard (one per environment)",
        "Ensure each Application deploys to its own isolated namespace",
        "Make the system resilient so Argo CD automatically reverts manual cluster changes",
        "Confirm that updates roll out automatically without leaving stale resources behind",
      ],
      toolbox: [
        { name: "kubectl", description: "Kubernetes CLI for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal UI for managing and inspecting your cluster", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", body: "Wait around 5 minutes for the Codespace to provision a Kubernetes cluster, Argo CD, and the sample app. Press Cmd+Shift+P (or Ctrl+Shift+P on Windows/Linux) and search for 'View Creation Log' to track progress." },
        { title: "Access Argo CD", body: `Open the Ports tab, find port 30100 (Argo CD), and click the forwarded address. Log in with:

\`\`\`
Username: readonly
Password: a-super-secure-password
\`\`\`` },
        { title: "Fix the ApplicationSet", body: `All errors are in this file:

\`\`\`
adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml
\`\`\`

This challenge uses Kustomize under the hood: a base set of manifests with environment-specific overlays (staging, prod). Argo CD detects and applies these automatically, so your focus is on fixing the ApplicationSet to properly reference the Kustomize-managed paths.

After making changes, apply them:

\`\`\`sh
kubectl apply -n argocd -f adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml
\`\`\`` },
        { title: "Run the Smoke Test", body: `Run the smoke test to verify your solution locally:

\`\`\`sh
adventures/01-echoes-lost-in-orbit/beginner/smoke-test.sh
\`\`\`` },
      ],
    },
    {
      id: "intermediate",
      name: "The Silent Canary",
      difficulty: "Intermediate",
      topics: ["Argo Rollouts", "PromQL"],
      learnings: [
        "Progressive delivery with Argo Rollouts",
        "Canary deployments & automated analysis",
        "Write PromQL queries for health validation",
        "Kube-state-metrics for deployment decisions",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-intermediate-the-silent-canary/310/8`,
      deadline: "24 December 2025 at 09:00 CET",
      intro: [
        "A canary rollout is stuck and the Zephyrians are still waiting to communicate.",
        "Debug the broken progressive delivery system by writing PromQL health checks that let Argo Rollouts automatically validate and advance the deployment.",
      ],
      backstory: [
        "After fixing the communication outage in Level 1, the Intergalactic Union welcomed a new species: the Zephyrians.",
        "The communications team attempted to deploy their language files using a progressive delivery system, but the rollout is failing. The Zephyrians are still waiting to communicate with the rest of the galaxy.",
        "A previous engineer configured automated canary deployments with health checks but left the setup incomplete.",
        "Your mission: debug the broken rollout and bring the Zephyrians' voices online.",
      ],
      objective: [
        "Pod info version 6.9.3 deployed successfully in both staging and production environments",
        "Rollouts automatically progress through canary stages based on health metrics",
        "Two working PromQL queries in the AnalysisTemplate that validate application health during releases",
        "All rollouts complete successfully",
      ],
      toolbox: [
        { name: "kubectl", description: "Kubernetes CLI for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal UI for managing and inspecting your cluster", url: "https://k9scli.io/" },
        { name: "Argo CD CLI", description: "manage Argo CD applications from the command line", url: "https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd/" },
        { name: "Argo Rollouts kubectl plugin", description: "extended kubectl commands for managing rollouts", url: "https://argo-rollouts.readthedocs.io/en/stable/features/kubectl-plugin/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", body: "Wait ~5-10 minutes for infrastructure to deploy. After it deploys, the setup script starts port forwarding to the Argo Rollouts dashboard, keeping a terminal busy. Open a new terminal to run commands." },
        { title: "Access the Dashboards", body: `Open the Ports tab. Log into Argo CD at port 30100:

\`\`\`
Username: readonly
Password: a-super-secure-password
\`\`\`

Access Argo Rollouts at port 30101 and Prometheus at port 30102.` },
        { title: "Fix the Manifests", body: `Review and fix the configuration in \`adventures/01-echoes-lost-in-orbit/intermediate/manifests/\`.

This challenge uses Kustomize under the hood: a base set of manifests with environment-specific overlays (staging, prod). Argo CD detects and applies these automatically, so you don't need to run Kustomize commands manually.` },
        { title: "Deploy Your Changes", body: `Commit and push your changes to trigger the deployment:

\`\`\`sh
git add adventures/01-echoes-lost-in-orbit/intermediate/manifests/
git commit -m "Fix configuration"
git push
\`\`\`

If pushing to a branch other than main, also update the ApplicationSet in \`appset.yaml\` to point to your branch.

Speed up Argo CD sync:

\`\`\`sh
argocd app get echo-server-staging --refresh
argocd app get echo-server-prod --refresh
\`\`\`` },
        { title: "Trigger and Monitor the Rollout", body: `After Argo CD syncs, retry the rollouts:

\`\`\`sh
kubectl argo rollouts retry rollout echo-server -n echo-staging
kubectl argo rollouts retry rollout echo-server -n echo-prod
\`\`\`

Watch canary progress (should advance 33% to 66% to 100%):

\`\`\`sh
kubectl argo rollouts get rollout echo-server -n echo-staging --watch
kubectl argo rollouts get rollout echo-server -n echo-prod --watch
\`\`\`

In real-world progressive delivery, staging is updated first, validated, and then changes are promoted to production. This challenge skips that separation so you can focus on the canary rollout mechanics and health checks without managing two promotion steps.` },
        { title: "Run the Smoke Test", body: `Run the smoke test to verify your solution:

\`\`\`sh
adventures/01-echoes-lost-in-orbit/intermediate/smoke-test.sh
\`\`\`` },
      ],
      helpfulLinks: [
        { label: "Argo Rollouts documentation", url: "https://argo-rollouts.readthedocs.io/en/stable/" },
        { label: "Analysis and progressive delivery", url: "https://argo-rollouts.readthedocs.io/en/stable/features/analysis/" },
        { label: "PromQL basics", url: "https://prometheus.io/docs/prometheus/latest/querying/basics/" },
        { label: "kube-state-metrics exposed metrics", url: "https://github.com/kubernetes/kube-state-metrics/tree/main/docs#exposed-metrics" },
      ],
    },
    {
      id: "expert",
      name: "Hyperspace Operations & Transport",
      difficulty: "Expert",
      topics: ["Argo Rollouts", "OpenTelemetry", "Jaeger", "PromQL"],
      learnings: [
        "Configure OpenTelemetry Collector pipelines",
        "Spanmetrics connector (traces to metrics)",
        "Detect idle canaries with traffic validation",
        "Distributed tracing with Jaeger",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_expert%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-expert-hyperspace-operations-transport/351/4`,
      deadline: "14 January 2026 at 09:00 CET",
      intro: [
        "The observability pipeline is broken and HotROD's canary can't validate.",
        "Wire an OpenTelemetry Collector with spanmetrics to convert distributed traces into Prometheus metrics, then write PromQL queries that catch idle canaries, high error rates, and latency spikes before they reach production.",
      ],
      backstory: [
        "After fixing the Zephyrian communications, word of your progressive release mastery spread across the galaxy. The Bytari, a highly advanced species from the Andromeda sector, were impressed.",
        "They want to apply progressive delivery to their mission-critical service: HotROD (Hyperspace Operations & Transport, Rapid Orbital Dispatch), an interstellar ride-sharing service handling dispatch requests across thousands of star systems. Every millisecond of latency matters, and any error could strand travelers between dimensions.",
        "A previous engineer started instrumenting HotROD with OpenTelemetry and configured Argo Rollouts for automated validation, but left the setup incomplete. The observability pipeline is broken. The Bytari don't use staging/production environments; they believe in single-environment progressive delivery validated purely by trace-derived metrics and automated health checks.",
        "Your mission: fix the observability pipeline and canary validation. Make HotROD deployment-ready with proper distributed tracing.",
      ],
      objective: [
        "Automated rollout progression to HotROD version 1.76.0 driven by observability signals",
        "OpenTelemetry Collector configured with an OTLP receiver for HotROD traces, a Spanmetrics connector converting traces to metrics, trace export to Jaeger, and metrics export to Prometheus",
        "Canary analysis with three PromQL queries: traffic detection (at least 0.05 req/s to prevent idle canaries), error rate below 5%, and 95th-percentile latency below 1000ms",
      ],
      toolbox: [
        { name: "kubectl", description: "Kubernetes CLI for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal UI for managing and inspecting your cluster", url: "https://k9scli.io/" },
        { name: "Argo CD CLI", description: "manage Argo CD applications from the command line", url: "https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd/" },
        { name: "Argo Rollouts kubectl plugin", description: "extended kubectl commands for managing rollouts", url: "https://argo-rollouts.readthedocs.io/en/stable/features/kubectl-plugin/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", body: "Wait ~5-10 minutes for infrastructure to deploy. Port forwarding starts automatically after infrastructure is ready, keeping a terminal busy. Open a new terminal to run commands." },
        { title: "Access the Dashboards", body: `Open the Ports tab. Log into Argo CD at port 30100:

\`\`\`
Username: readonly
Password: a-super-secure-password
\`\`\`

Access Argo Rollouts at 30101, Prometheus at 30102, and Jaeger at 30103.` },
        { title: "Fix the Manifests", body: `Fix the manifests in \`adventures/01-echoes-lost-in-orbit/expert/manifests/\`. Use the Argo Rollouts dashboard, Prometheus UI, and Jaeger UI to debug and validate your changes.` },
        { title: "Deploy Your Changes", body: `Commit and push to trigger the deployment:

\`\`\`sh
git add adventures/01-echoes-lost-in-orbit/expert/manifests/
git commit -m "Fix configuration"
git push
\`\`\`

If pushing to a branch other than main, also update the ApplicationSet in \`appset.yaml\` to point to your branch.

Refresh Argo CD apps:

\`\`\`sh
argocd app get hotrod --refresh
argocd app get otel --refresh
\`\`\`

If you changed HotROD, retry the rollout:

\`\`\`sh
kubectl argo rollouts retry rollout hotrod -n hotrod
\`\`\`

If you changed the OTel Collector config, restart it:

\`\`\`sh
kubectl rollout restart daemonset/collector -n otel
\`\`\`` },
        { title: "Watch the Rollout", body: `Watch rollout progress. The rollout should progress automatically based on analysis metrics:

\`\`\`sh
kubectl argo rollouts get rollout hotrod -n hotrod --watch
\`\`\`` },
        { title: "Run the Smoke Test", body: `Run the smoke test to verify your solution:

\`\`\`sh
adventures/01-echoes-lost-in-orbit/expert/smoke-test.sh
\`\`\`` },
      ],
      helpfulLinks: [
        { label: "OpenTelemetry Collector configuration", url: "https://opentelemetry.io/docs/collector/configuration/" },
        { label: "Span Metrics Connector", url: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector" },
        { label: "Argo Rollouts analysis", url: "https://argo-rollouts.readthedocs.io/en/stable/features/analysis/" },
        { label: "PromQL basics", url: "https://prometheus.io/docs/prometheus/latest/querying/basics/" },
      ],
    },
  ],
};
