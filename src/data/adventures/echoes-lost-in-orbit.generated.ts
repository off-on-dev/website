import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const ECHOES_LOST_IN_ORBIT: Adventure = {
  id: "echoes-lost-in-orbit",
  title: "Echoes Lost in Orbit",
  icon: "Satellite",
  month: "DEC 2025",
  story: "Restore interstellar communications by fixing broken GitOps setups, progressive delivery systems, and observability pipelines across three galactic missions.",
  metaDescription: "Echoes Lost in Orbit: a hands-on Argo CD, Argo Rollouts, OpenTelemetry adventure on OffOn.",
  tags: ["Argo CD", "Argo Rollouts", "OpenTelemetry", "Jaeger", "PromQL"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    aboutHtml: "<abbr data-title=\"Developer Relations\" tabindex=\"0\" aria-describedby=\"abbr-exp-52\">DevRel</abbr><span id=\"abbr-exp-52\" class=\"sr-only\">Developer Relations</span> at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
  },
  backstory: [
    "Welcome aboard the <abbr data-title=\"Git Operations\" tabindex=\"0\" aria-describedby=\"abbr-exp-53\">GitOps</abbr><span id=\"abbr-exp-53\" class=\"sr-only\">Git Operations</span> Starliner, a multi-species engineering vessel orbiting the vibrant planet of Polaris-9. Life in this quadrant is wonderfully diverse, from the whispering cloud-dwellers of Nebulon to the rhythmic click-speakers of Crustacea Prime.",
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
        "Debug <abbr data-title=\"Git Operations\" tabindex=\"0\" aria-describedby=\"abbr-exp-54\">GitOps</abbr><span id=\"abbr-exp-54\" class=\"sr-only\">Git Operations</span> flows with Argo CD",
        "ApplicationSet templating &#x26; pitfalls",
        "Environment isolation &#x26; namespaces",
        "Sync policies: automated, prune &#x26; self-heal",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-easy-broken-echoes/117/40`,
      deadline: "2025-12-10T09:00:00+01:00",
      intro: [
        "The Echo Server is down across both environments. Investigate the Argo CD ApplicationSet configuration, spot the templating pitfalls, and restore proper multi-environment delivery.",
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
        { name: "kubectl", description: "Kubernetes <abbr data-title=\"Command Line Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-55\">CLI</abbr><span id=\"abbr-exp-55\" class=\"sr-only\">Command Line Interface</span> for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal <abbr data-title=\"User Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-56\">UI</abbr><span id=\"abbr-exp-56\" class=\"sr-only\">User Interface</span> for managing and inspecting your cluster", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", content: "<p>Wait around 5 minutes for the Codespace to provision a Kubernetes cluster, Argo CD, and the sample app. Press Cmd+Shift+P (or Ctrl+Shift+P on Windows/Linux) and search for 'View Creation Log' to track progress.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 30100:</strong> Argo CD (readonly / a-super-secure-password). View application sync status and manage Argo CD resources.</li>
</ul>` },
        { title: "Fix the ApplicationSet", content: `<p>All errors are in this file:</p>
<pre tabindex="0" aria-label="Code block"><code>adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml
</code></pre>
<p>This challenge uses Kustomize under the hood: a base set of manifests with environment-specific overlays (staging, prod). Argo CD detects and applies these automatically, so your focus is on fixing the ApplicationSet to properly reference the Kustomize-managed paths.</p>
<p>After making changes, apply them:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">kubectl apply -n argocd -f adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml
</code></pre>` },
        { title: "Run the Smoke Test", content: `<p>Run the smoke test to verify your solution locally:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">adventures/01-echoes-lost-in-orbit/beginner/smoke-test.sh
</code></pre>` },
      ],
      verification: {
        command: "adventures/01-echoes-lost-in-orbit/beginner/smoke-test.sh",
        description: "Once you think you've solved the challenge, run the smoke test to verify your solution.",
      },
      metaDescription: "Broken Echoes: The Echo Server is down across both environments. Investigate the Argo CD ApplicationSet configuration, spot the templating pitfalls, and...",
    },
    {
      id: "intermediate",
      name: "The Silent Canary",
      difficulty: "Intermediate",
      topics: ["Argo Rollouts", "PromQL"],
      learnings: [
        "Progressive delivery with Argo Rollouts",
        "Canary deployments &#x26; automated analysis",
        "Write PromQL queries for health validation",
        "Kube-state-metrics for deployment decisions",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F01-echoes-lost-in-orbit_intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-01-echoes-lost-in-orbit-intermediate-the-silent-canary/310/8`,
      deadline: "2025-12-24T09:00:00+01:00",
      intro: [
        "A canary rollout is stuck and the Zephyrians are still waiting to communicate. Debug the broken progressive delivery system by writing PromQL health checks that let Argo Rollouts automatically validate and advance the deployment.",
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
        { name: "kubectl", description: "Kubernetes <abbr data-title=\"Command Line Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-57\">CLI</abbr><span id=\"abbr-exp-57\" class=\"sr-only\">Command Line Interface</span> for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal <abbr data-title=\"User Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-58\">UI</abbr><span id=\"abbr-exp-58\" class=\"sr-only\">User Interface</span> for managing and inspecting your cluster", url: "https://k9scli.io/" },
        { name: "Argo CD CLI", description: "manage Argo CD applications from the command line", url: "https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd/" },
        { name: "Argo Rollouts kubectl plugin", description: "extended kubectl commands for managing rollouts", url: "https://argo-rollouts.readthedocs.io/en/stable/features/kubectl-plugin/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", content: "<p>Wait ~5-10 minutes for infrastructure to deploy. After it deploys, the setup script starts port forwarding to the Argo Rollouts dashboard, keeping a terminal busy. Open a new terminal to run commands.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 30100:</strong> Argo CD (readonly / a-super-secure-password). Shows sync status. Use to refresh applications after pushing commits.</li>
<li><strong>Port 30101:</strong> Argo Rollouts. Shows canary deployment progress and analysis status.</li>
<li><strong>Port 30102:</strong> Prometheus. Explore available metrics and test PromQL queries. CLI tools work equally well if you prefer the terminal.</li>
</ul>` },
        { title: "Fix the Manifests", content: `<p>Review and fix the configuration in <code>adventures/01-echoes-lost-in-orbit/intermediate/manifests/</code>.</p>
<p>This challenge uses Kustomize under the hood: a base set of manifests with environment-specific overlays (staging, prod). Argo CD detects and applies these automatically, so you don't need to run Kustomize commands manually.</p>` },
        { title: "Deploy Your Changes", content: `<p>Commit and push your changes to trigger the deployment:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">git add adventures/01-echoes-lost-in-orbit/intermediate/manifests/
git commit -m "Fix configuration"
git push
</code></pre>
<p>If pushing to a branch other than main, also update the ApplicationSet in <code>appset.yaml</code> to point to your branch.</p>
<p>Speed up Argo CD sync:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">argocd app get echo-server-staging --refresh
argocd app get echo-server-prod --refresh
</code></pre>` },
        { title: "Trigger the Rollout", content: `<p>After Argo CD syncs, retry the rollouts:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">kubectl argo rollouts retry rollout echo-server -n echo-staging
kubectl argo rollouts retry rollout echo-server -n echo-prod
</code></pre>` },
        { title: "Watch the Rollout", content: `<p>Watch canary progress (should advance 33% to 66% to 100%):</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">kubectl argo rollouts get rollout echo-server -n echo-staging --watch
kubectl argo rollouts get rollout echo-server -n echo-prod --watch
</code></pre>
<p>In real-world progressive delivery, staging is updated first, validated, and then changes are promoted to production. This challenge skips that separation so you can focus on the canary rollout mechanics and health checks without managing two promotion steps.</p>` },
        { title: "Run the Smoke Test", content: `<p>Run the smoke test to verify your solution:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">adventures/01-echoes-lost-in-orbit/intermediate/smoke-test.sh
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "Argo Rollouts documentation", url: "https://argo-rollouts.readthedocs.io/en/stable/" },
        { title: "Analysis and progressive delivery", url: "https://argo-rollouts.readthedocs.io/en/stable/features/analysis/" },
        { title: "PromQL basics", url: "https://prometheus.io/docs/prometheus/latest/querying/basics/" },
        { title: "kube-state-metrics exposed metrics", url: "https://github.com/kubernetes/kube-state-metrics/tree/main/docs#exposed-metrics" },
      ],
      verification: {
        command: "adventures/01-echoes-lost-in-orbit/intermediate/smoke-test.sh",
        description: "Once you think you've solved the challenge, run the smoke test to verify your solution.",
      },
      metaDescription: "The Silent Canary: A canary rollout is stuck and the Zephyrians are still waiting to communicate. Debug the broken progressive delivery system by writing...",
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
      deadline: "2026-01-14T09:00:00+01:00",
      intro: [
        "The observability pipeline is broken and HotROD's canary can't validate. Wire an OpenTelemetry Collector with spanmetrics to convert distributed traces into Prometheus metrics, then write PromQL queries that catch idle canaries, high error rates, and latency spikes.",
      ],
      backstory: [
        "After fixing the Zephyrian communications, word of your progressive release mastery spread across the galaxy. The Bytari, a highly advanced species from the Andromeda sector, were impressed.",
        "They want to apply progressive delivery to their mission-critical service: HotROD (Hyperspace Operations &#x26; Transport, Rapid Orbital Dispatch), an interstellar ride-sharing service handling dispatch requests across thousands of star systems. Every millisecond of latency matters, and any error could strand travelers between dimensions.",
        "A previous engineer started instrumenting HotROD with OpenTelemetry and configured Argo Rollouts for automated validation, but left the setup incomplete. The observability pipeline is broken. The Bytari don't use staging/production environments; they believe in single-environment progressive delivery validated purely by trace-derived metrics and automated health checks.",
        "Your mission: fix the observability pipeline and canary validation. Make HotROD deployment-ready with proper distributed tracing.",
      ],
      objective: [
        "Automated rollout progression to HotROD version 1.76.0 driven by observability signals",
        "OpenTelemetry Collector configured with an <abbr data-title=\"OpenTelemetry Protocol\" tabindex=\"0\" aria-describedby=\"abbr-exp-59\">OTLP</abbr><span id=\"abbr-exp-59\" class=\"sr-only\">OpenTelemetry Protocol</span> receiver for HotROD traces, a Spanmetrics connector converting traces to metrics, trace export to Jaeger, and metrics export to Prometheus",
        "Canary analysis with three PromQL queries: traffic detection (at least 0.05 req/s to prevent idle canaries), error rate below 5%, and 95th-percentile latency below 1000ms",
      ],
      toolbox: [
        { name: "kubectl", description: "Kubernetes <abbr data-title=\"Command Line Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-60\">CLI</abbr><span id=\"abbr-exp-60\" class=\"sr-only\">Command Line Interface</span> for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal <abbr data-title=\"User Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-61\">UI</abbr><span id=\"abbr-exp-61\" class=\"sr-only\">User Interface</span> for managing and inspecting your cluster", url: "https://k9scli.io/" },
        { name: "Argo CD CLI", description: "manage Argo CD applications from the command line", url: "https://argo-cd.readthedocs.io/en/latest/user-guide/commands/argocd/" },
        { name: "Argo Rollouts kubectl plugin", description: "extended kubectl commands for managing rollouts", url: "https://argo-rollouts.readthedocs.io/en/stable/features/kubectl-plugin/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", content: "<p>Wait ~5-10 minutes for infrastructure to deploy. Port forwarding starts automatically after infrastructure is ready, keeping a terminal busy. Open a new terminal to run commands.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 30100:</strong> Argo CD (readonly / a-super-secure-password). Shows sync status. Use to refresh applications after pushing commits.</li>
<li><strong>Port 30101:</strong> Argo Rollouts. Shows canary deployment progress and analysis status.</li>
<li><strong>Port 30102:</strong> Prometheus. Explore available metrics and test PromQL queries. CLI tools work equally well if you prefer the terminal.</li>
<li><strong>Port 30103:</strong> Jaeger. Shows distributed traces from HotROD to verify that tracing is working end-to-end.</li>
</ul>` },
        { title: "Fix the Manifests", content: "<p>Fix the manifests in <code>adventures/01-echoes-lost-in-orbit/expert/manifests/</code>. Use the Argo Rollouts dashboard, Prometheus UI, and Jaeger UI to debug and validate your changes.</p>" },
        { title: "Deploy Your Changes", content: `<p>Commit and push to trigger the deployment:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">git add adventures/01-echoes-lost-in-orbit/expert/manifests/
git commit -m "Fix configuration"
git push
</code></pre>
<p>If pushing to a branch other than main, also update the ApplicationSet in <code>appset.yaml</code> to point to your branch.</p>
<p>Refresh Argo CD apps:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">argocd app get hotrod --refresh
argocd app get otel --refresh
</code></pre>
<p>If you changed HotROD, retry the rollout:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">kubectl argo rollouts retry rollout hotrod -n hotrod
</code></pre>
<p>If you changed the <abbr data-title="OpenTelemetry" tabindex="0" aria-describedby="abbr-exp-62">OTel</abbr><span id="abbr-exp-62" class="sr-only">OpenTelemetry</span> Collector config, restart it:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">kubectl rollout restart daemonset/collector -n otel
</code></pre>` },
        { title: "Watch the Rollout", content: `<p>Watch rollout progress. The rollout should progress automatically based on analysis metrics:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">kubectl argo rollouts get rollout hotrod -n hotrod --watch
</code></pre>` },
        { title: "Run the Smoke Test", content: `<p>Run the smoke test to verify your solution:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">adventures/01-echoes-lost-in-orbit/expert/smoke-test.sh
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "OpenTelemetry Collector configuration", url: "https://opentelemetry.io/docs/collector/configuration/" },
        { title: "Span Metrics Connector", url: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector" },
        { title: "Argo Rollouts analysis", url: "https://argo-rollouts.readthedocs.io/en/stable/features/analysis/" },
        { title: "PromQL basics", url: "https://prometheus.io/docs/prometheus/latest/querying/basics/" },
      ],
      verification: {
        command: "adventures/01-echoes-lost-in-orbit/expert/smoke-test.sh",
        description: "Once you think you've solved the challenge, run the smoke test to verify your solution.",
      },
      metaDescription: "Hyperspace Operations & Transport: The observability pipeline is broken and HotROD's canary can't validate. Wire an OpenTelemetry Collector with spanmetrics...",
    },
  ],
};
