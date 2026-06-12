import type { Solution } from "@/data/solutions/types";
import { KATHARINA_SICK } from "@/data/adventures/contributors";

export const solution: Solution = {
  adventureId: "echoes-lost-in-orbit",
  levelId: "intermediate",
  title: "Intermediate Solution: The Silent Canary",
  contributor: { name: KATHARINA_SICK.name, url: KATHARINA_SICK.url },
  spoilerWarning:
    "This walkthrough contains the full solution. Try solving the challenge yourself first, then come back if you get stuck or want to compare approaches.",
  intro:
    "We'll approach this exactly as you would: start with the objectives, break them down one by one, and systematically fix what's broken.",
  context: {
    title: "Understanding the Setup",
    body: [
      {
        type: "text",
        html: "<p>All files are in <code>adventures/01-echoes-lost-in-orbit/intermediate/manifests</code>. The structure looks like this:</p><ul><li><strong>appset.yaml</strong>: An Argo CD ApplicationSet that generates Applications for staging and prod using the Git directory generator.</li><li><strong>base/</strong>: The base Kustomize configuration for the echo-server app, containing the AnalysisTemplate, Rollout, Service, and kustomization.yaml.</li><li><strong>overlays/</strong>: Environment-specific overlays that adjust replica counts for staging and prod.</li></ul>",
      },
      {
        type: "callout",
        variant: "info",
        html: "<p>All steps in this guide use the staging environment. Since staging and production are identical except for replica count, the same fixes apply to both. We'll only mention staging throughout.</p>",
      },
    ],
  },
  steps: [
    {
      id: "podinfo-version",
      title: "Pod Info Version 6.9.3 Deployed",
      intro:
        "The rollout already targets image 6.9.3, but the stable replica set is still running 6.8.0. Something is blocking progression.",
      body: [
        {
          type: "text",
          html: "<p>Check which version is running and why the rollout is stuck:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl -n echo-staging get rollout echo-server -o yaml",
        },
        {
          type: "text",
          html: "<p>The <code>spec.template.spec.containers[0].image</code> field shows <code>stefanprodan/podinfo:6.9.3</code> as desired. But scrolling down to <code>status.conditions</code> reveals an error:</p>",
        },
        {
          type: "code",
          language: "yaml",
          code: `- message: 'Rollout aborted update to revision 2: Metric "container-restarts" assessed
    Error due to consecutiveErrors (1) > consecutiveErrorLimit (0): "Error Message:
    Post "http://prom-server.prometheus.svc.cluster.local/api/v1/query": dial tcp:
    lookup prom-server.prometheus.svc.cluster.local on 10.96.0.10:53: no such host"'
  reason: RolloutAborted
  status: "False"
  type: Progressing`,
        },
        {
          type: "text",
          html: "<p>To confirm what is actually serving traffic, look up the <code>status.stableRS</code> hash and inspect that replica set directly:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "# status.stableRS: 6fdd67656d\nkubectl -n echo-staging get replicaset echo-server-6fdd67656d -o yaml",
        },
        {
          type: "code",
          language: "yaml",
          code: `spec:
  template:
    spec:
      containers:
        - name: echo-server
          image: stefanprodan/podinfo:6.8.0`,
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-failed-release.webp",
          alt: "Argo Rollouts UI showing a failed release with an aborted rollout status",
          caption: "The Argo Rollouts UI confirms the rollout is aborted",
        },
        {
          type: "text",
          html: "<p>The rollout aborted due to an error in the AnalysisTemplate. Fixing the analysis is what will unblock the version upgrade. Move on to the next objective to investigate.</p>",
        },
      ],
      takeaways: [
        "Argo Rollouts won't progress a rollout if there are errors in the configuration.",
        "Check rollout status conditions first when a rollout appears stuck.",
      ],
    },
    {
      id: "automatic-canary-progression",
      title: "Automatic Canary Progression Based on Health Metrics",
      intro:
        "The rollout is aborted because the AnalysisTemplate is referencing a Prometheus service that does not exist. There are also two bugs in the metric definitions themselves.",
      body: [
        {
          type: "text",
          html: "<p>Inspect the AnalysisTemplate directly:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl -n echo-staging get analysistemplate echo-analysis -o yaml",
        },
        {
          type: "text",
          html: "<p>Or open the file at <code>adventures/01-echoes-lost-in-orbit/intermediate/manifests/base/analysis-template.yaml</code>. You will find two metrics: <code>container-restarts</code> and <code>ready-containers</code>.</p><p><strong>Bug 1: wrong Prometheus service name.</strong> The error says it cannot reach <code>prom-server.prometheus.svc.cluster.local</code>. Let's check if this service exists. The URL follows the structure <code>http://&lt;service-name&gt;.&lt;namespace&gt;.svc.cluster.local</code>, so we run:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl -n prometheus get service",
        },
        {
          type: "text",
          html: "<p>This outputs one service called <code>prometheus-server</code>, not <code>prom-server</code>. There's a typo in the manifest. Fix the address in <code>container-restarts</code>:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 1: correct Prometheus address",
          code: "address: http://prometheus-server.prometheus.svc.cluster.local",
        },
        {
          type: "text",
          html: "<p>Commit, push, then retry the rollout:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl argo rollouts retry rollout echo-server -n echo-staging\nkubectl argo rollouts -n echo-staging status echo-server",
        },
        {
          type: "text",
          html: "<p>A new error appears:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: `Degraded - RolloutAborted: Rollout aborted update to revision 2: Metric "container-restarts" assessed Failed due to failed (1) > failureLimit (0)`,
        },
        {
          type: "text",
          html: "<p><strong>Bug 2: inverted success condition.</strong> The <code>container-restarts</code> query returns 0 when there are no restarts, which is the healthy state. But the current condition <code>result[0] &gt; 0</code> only passes when restarts exist. Invert it:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 2: correct success condition",
          code: "successCondition: result[0] == 0",
        },
        {
          type: "text",
          html: "<p>Commit, push, and retry again. Open the Argo Rollouts UI, select the <code>echo-staging</code> namespace, and click the rollout card. You will see multiple AnalysisRuns accumulate as each retry creates a new one:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-rollouts-ui-status.webp",
          alt: "Argo Rollouts UI showing three analysis runs for the same rollout revision",
          caption: "Each retry creates a new AnalysisRun; earlier ones show the previous errors",
        },
        {
          type: "text",
          html: "<p>Click the latest AnalysisRun. The <code>container-restarts</code> metric is now passing, but <code>ready-containers</code> is failing:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-analysis-error.webp",
          alt: "AnalysisRun detail showing container-restarts passing and ready-containers failing",
        },
        {
          type: "text",
          html: "<p>Clicking the <code>ready-containers</code> metric on the left reveals the query body is empty:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-analysis-error-query.webp",
          alt: "AnalysisTemplate ready-containers metric showing an empty query body",
        },
        {
          type: "text",
          html: "<p><strong>Bug 3: missing query implementation.</strong> The <code>ready-containers</code> metric has no query. Open the Prometheus UI (port 30102 in VS Code's Ports tab) and explore metrics beginning with <code>kube_pod_container_status_</code>. Choose <code>kube_pod_container_status_ready</code>:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-prometheus-metrics.webp",
          alt: "Prometheus UI autocomplete showing kube_pod_container_status_ready selected",
        },
        {
          type: "text",
          html: "<p>Filter to your namespace and pods, then run:</p>",
        },
        {
          type: "code",
          language: "sql",
          code: `kube_pod_container_status_ready{
  namespace="echo-staging",
  pod=~"echo-server-.*"
}`,
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-prometheus-ready-containers.webp",
          alt: "Prometheus query returning a list of ready container metrics per pod",
        },
        {
          type: "text",
          html: "<p>This returns a list. Wrap it in <code>sum()</code> to get a single count:</p>",
        },
        {
          type: "code",
          language: "sql",
          code: `sum(
  kube_pod_container_status_ready{
    namespace="echo-staging",
    pod=~"echo-server-.*"
  }
)`,
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/intermediate-prometheus-ready-containers-sum.webp",
          alt: "Prometheus query result showing a single value of 1 for ready containers",
          caption: "The aggregated query returns 1, which satisfies successCondition: result[0] >= 1",
        },
        {
          type: "text",
          html: "<p>Replace the hardcoded namespace with <code>{{args.namespace}}</code> so it works for both environments, and add <code>or vector(0)</code> as a fallback for when no data exists yet:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 3: implement ready-containers query",
          code: `query: |-
  sum(kube_pod_container_status_ready{
    namespace="{{args.namespace}}",
    pod=~"echo-server-.*"
  }) or vector(0)`,
        },
        {
          type: "text",
          html: "<p>Commit, push, and retry once more. This time the rollout progresses through all canary stages and completes successfully.</p>",
        },
      ],
      takeaways: [
        "There are multiple effective ways to debug Argo Rollouts. Try them and use your favorite.",
        "Service references follow the format service-name.namespace.svc.cluster.local. A typo here causes a silent DNS lookup failure at runtime.",
        "Prometheus queries are a simple and effective way to validate application health during rollouts.",
        "The Prometheus UI is a great way to test and build your queries before adding them to an AnalysisTemplate.",
      ],
    },
    {
      id: "promql-health-checks",
      title: "Two Working PromQL Queries in the AnalysisTemplate",
      intro:
        "This objective is resolved by the previous step. Both metrics are now implemented and validated.",
      body: [
        {
          type: "text",
          html: "<p>With the fixes in place, the AnalysisTemplate contains two working health checks:</p><ul><li><strong>container-restarts</strong>: confirms zero container restarts during the rollout window.</li><li><strong>ready-containers</strong>: confirms at least one container is ready before the rollout progresses.</li></ul>",
        },
      ],
    },
    {
      id: "rollouts-complete",
      title: "All Rollouts Complete Successfully",
      intro:
        "Once both metrics pass, Argo Rollouts advances through the canary stages automatically and marks the rollout complete in both staging and production.",
      body: [
        {
          type: "text",
          html: "<p>Apply the same analysis-template fix in the production overlay if needed, or let Argo CD sync it automatically. Both environments will complete the rollout to podinfo 6.9.3 without manual intervention.</p>",
        },
        {
          type: "callout",
          variant: "tip",
          html: "<p>Run the smoke test to confirm all objectives are met: <code>adventures/01-echoes-lost-in-orbit/intermediate/smoke-test.sh</code></p>",
        },
      ],
    },
  ],
  furtherReading: [
    {
      title: "Progressive Delivery with Argo Rollouts",
      url: "https://argo-rollouts.readthedocs.io/en/stable/concepts/",
    },
    {
      title: "Argo Rollouts Analysis",
      url: "https://argo-rollouts.readthedocs.io/en/stable/features/analysis/",
    },
    {
      title: "Prometheus Querying Basics",
      url: "https://prometheus.io/docs/prometheus/latest/querying/basics/",
    },
    {
      title: "Kustomize documentation",
      url: "https://kustomize.io/",
    },
  ],
  completeSolution: {
    title: "Complete AnalysisTemplate",
    description:
      "All three fixes applied: correct Prometheus address, corrected success condition, and implemented ready-containers query.",
    language: "yaml",
    code: `apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: echo-analysis
spec:
  args:
    - name: namespace
  metrics:
    - name: container-restarts
      successCondition: result[0] == 0
      failureLimit: 0
      inconclusiveLimit: 0
      consecutiveErrorLimit: 0
      count: 1
      provider:
        prometheus:
          address: http://prometheus-server.prometheus.svc.cluster.local
          query: |
            # There should be no restarts
            sum(increase(kube_pod_container_status_restarts_total{
              namespace="{{args.namespace}}",
              pod=~"echo-server-.*"
            }[1m])) or vector(0)
    - name: ready-containers
      successCondition: result[0] >= 1
      failureLimit: 0
      inconclusiveLimit: 0
      consecutiveErrorLimit: 0
      count: 1
      provider:
        prometheus:
          address: http://prometheus-server.prometheus.svc.cluster.local
          query: |-
            # Check how many containers are ready (should be at least 1)
            sum(kube_pod_container_status_ready{
              namespace="{{args.namespace}}",
              pod=~"echo-server-.*"
            }) or vector(0)`,
  },
  outro: {
    heading: "The Canary Sings",
    html: "<p>The deployment pipeline is no longer silent. Both environments advanced to podinfo 6.9.3 guided by health checks that now actually check health. The Zephyrian relay network is back online, and the canary has earned its promotion.</p><p>Every crew navigates a broken deployment differently. See how others got their rollouts unstuck.</p>",
  },
};
