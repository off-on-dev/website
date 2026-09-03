import type { Solution } from "@/data/solutions/types";
import { KATHARINA_SICK } from "@/data/adventures/contributors";

export const solution: Solution = {
  adventureId: "echoes-lost-in-orbit",
  levelId: "expert",
  title: "Expert Solution: Hyperspace Operations & Transport",
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
        html: "<p>All files are in <code>adventures/01-echoes-lost-in-orbit/expert/manifests</code>. Three applications are deployed via an Argo CD ApplicationSet:</p><ul><li><strong>hotrod/</strong>: The HotROD app, managed by an Argo Rollouts Rollout with a canary strategy and an AnalysisTemplate for health gating.</li><li><strong>otel/</strong>: The OpenTelemetry Collector, configured as a DaemonSet to receive traces from HotROD, convert them to metrics via the Spanmetrics connector, and export to Jaeger and Prometheus.</li><li><strong>traffic-generator/</strong>: A simple app that continuously sends requests to HotROD to generate observable traffic.</li></ul>",
      },
      {
        type: "text",
        html: "<p>The OpenTelemetry Collector config has four main sections: <strong>receivers</strong> (where data enters), <strong>connectors</strong> (bridge between pipelines, e.g. Spanmetrics converts traces to metrics), <strong>exporters</strong> (where data is sent), and <strong>service pipelines</strong> (the wiring). Understanding this structure is key to Objective 2.</p>",
      },
    ],
  },
  steps: [
    {
      id: "automated-rollout",
      title: "Automated Rollout Progression to HotROD 1.76.0",
      intro:
        "This objective depends on the other two. The rollout is currently aborted because the AnalysisTemplate has no data to evaluate, which in turn is because the OpenTelemetry Collector is not running.",
      body: [
        {
          type: "text",
          html: "<p>Open Argo CD to see the current state of all three applications:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/expert-argocd-apps.webp",
          alt: "Argo CD showing three apps: hotrod degraded, otel progressing, traffic-generator healthy",
          caption: "hotrod is degraded due to a failed AnalysisRun; otel keeps crashing; traffic-generator is healthy",
        },
        {
          type: "text",
          html: "<p>Fix Objectives 2 and 3 first. Once the collector is running and the AnalysisTemplate is complete, retry the rollout and it will progress automatically.</p>",
        },
      ],
    },
    {
      id: "otel-collector",
      title: "OpenTelemetry Collector Configured",
      intro:
        "The collector is crash-looping with \"invalid configuration: no receiver configuration specified in config\". Three things need to be added: an OTLP receiver, a metrics pipeline, and a Prometheus exporter.",
      body: [
        {
          type: "text",
          html: "<p>Open <code>adventures/01-echoes-lost-in-orbit/expert/manifests/otel/config.yaml</code>. The starting state looks like this:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "otel/config.yaml (broken)",
          code: `receivers:
  # empty

connectors:
  spanmetrics:
    dimensions:
      - name: hotrod.namespace
      - name: hotrod.pod.name
      - name: hotrod.pod.hash

exporters:
  debug:
    verbosity: detailed
  otlp:
    endpoint: jaeger-collector.jaeger.svc.cluster.local:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug, otlp, spanmetrics]`,
        },
        {
          type: "text",
          html: "<p><strong>Fix 1: add the OTLP receiver.</strong> Check how HotROD exports traces by looking at the rollout environment variables:</p>",
        },
        {
          type: "code",
          language: "yaml",
          code: `env:
  - name: OTEL_EXPORTER_OTLP_ENDPOINT
    value: "http://collector.otel.svc.cluster.local:4318"`,
        },
        {
          type: "text",
          html: "<p>Port 4318 is OTLP/HTTP. Add a matching receiver:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 1: OTLP/HTTP receiver",
          code: `receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318`,
        },
        {
          type: "text",
          html: "<p><strong>Fix 2: add a metrics pipeline.</strong> The Spanmetrics connector already exists and is wired into the traces pipeline as an exporter, which generates metrics. But those metrics need a pipeline to flow through. Add one pointing to the debug exporter as a first step:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 2: metrics pipeline",
          code: `service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug, otlp, spanmetrics]
    metrics:
      receivers: [spanmetrics]
      exporters: [debug]`,
        },
        {
          type: "text",
          html: "<p><strong>Fix 3: export metrics to Prometheus.</strong> The AnalysisTemplate will query Prometheus for the spanmetrics data, so a Prometheus exporter is required. Check <code>otel/daemonset.yaml</code> for the port that Prometheus is already configured to scrape:</p>",
        },
        {
          type: "callout",
          variant: "info",
          html: "<p>Look for the port named <code>prometheus</code> in the DaemonSet spec and the <code>prometheus.io/port</code> pod annotation. Both point to port <code>8889</code>.</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 3: Prometheus exporter",
          code: `exporters:
  debug:
    verbosity: detailed
  otlp:
    endpoint: jaeger-collector.jaeger.svc.cluster.local:4317
    tls:
      insecure: true
  prometheus:
    endpoint: "0.0.0.0:8889"`,
        },
        {
          type: "text",
          html: "<p>Update the metrics pipeline to include the Prometheus exporter, then commit and push. After Argo CD syncs, restart the collector:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "argocd app get otel --refresh\nkubectl rollout restart daemonset/collector -n otel",
        },
        {
          type: "text",
          html: "<p>The collector is now healthy. Traces appear in Jaeger and metrics arrive in Prometheus:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/expert-jaeger-traces.webp",
          alt: "Jaeger UI showing HotROD traces distributed across services",
          caption: "Traces from HotROD flowing through the collector into Jaeger",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/expert-prometheus-metrics.webp",
          alt: "Prometheus UI showing spanmetrics derived from HotROD traces",
          caption: "Span-derived metrics now queryable in Prometheus",
        },
      ],
      takeaways: [
        "The OpenTelemetry Collector requires at least one receiver in each pipeline, and every component referenced in a pipeline must be defined in its section.",
        "The Spanmetrics connector acts as both an exporter in the traces pipeline and a receiver in the metrics pipeline, bridging the two.",
      ],
    },
    {
      id: "canary-analysis",
      title: "Canary Analysis with Three PromQL Queries",
      intro:
        "The AnalysisTemplate already has error-rate and latency metrics, but the latency metric was failing because Prometheus had no spanmetrics data yet. A third metric for traffic detection is missing entirely.",
      body: [
        {
          type: "text",
          html: "<p>Open the Argo Rollouts dashboard and review the last AnalysisRun. The <code>error-rate-lt-5-percent</code> check passed, but <code>latency-p95-lt-1s</code> errored with <code>slice index out of range</code>:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/expert-rollouts-analysis-failed.webp",
          alt: "Argo Rollouts AnalysisRun showing error-rate passing and latency-p95 erroring",
          caption: "The latency metric errored because no spanmetrics data existed in Prometheus yet",
        },
        {
          type: "text",
          html: "<p>Now that the collector is running, the latency query will have data to evaluate. The query itself is correct and does not need to change.</p><p><strong>Missing metric: traffic detection.</strong> Without a minimum traffic check, a canary could be promoted without ever receiving a real request. Add this metric first:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Add: traffic-detection metric",
          code: `- name: traffic-detection
  initialDelay: 90s
  interval: 10s
  count: 5
  successCondition: result[0] >= 0.05
  failureLimit: 3
  inconclusiveLimit: 5
  consecutiveErrorLimit: 3
  provider:
    prometheus:
      address: http://prometheus-server.prometheus.svc.cluster.local
      query: |
        sum(rate(hotrod_requests_total{
          namespace="{{args.namespace}}",
          rollouts_pod_template_hash="{{args.canary-hash}}"
        }[2m]))`,
        },
        {
          type: "text",
          html: "<p>Commit, push, refresh the Argo CD app, and retry the rollout:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "argocd app get hotrod --refresh\nkubectl argo rollouts retry rollout hotrod -n hotrod",
        },
        {
          type: "text",
          html: "<p>This time all three metrics pass and the rollout completes:</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/expert-rollouts-analysis-success.webp",
          alt: "Argo Rollouts AnalysisRun showing all three metrics passing with green status",
          caption: "All three metrics pass, and the rollout advances to HotROD 1.76.0",
        },
        {
          type: "text",
          html: "<p>The complete AnalysisTemplate with all three metrics:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Complete AnalysisTemplate",
          code: `apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: hotrod-analysis
spec:
  args:
    - name: namespace
    - name: canary-hash
  metrics:
    - name: traffic-detection
      initialDelay: 90s
      interval: 10s
      count: 5
      successCondition: result[0] >= 0.05
      failureLimit: 3
      inconclusiveLimit: 5
      consecutiveErrorLimit: 3
      provider:
        prometheus:
          address: http://prometheus-server.prometheus.svc.cluster.local
          query: |
            sum(rate(hotrod_requests_total{
              namespace="{{args.namespace}}",
              rollouts_pod_template_hash="{{args.canary-hash}}"
            }[2m]))
    - name: error-rate-lt-5-percent
      initialDelay: 60s
      interval: 10s
      count: 3
      successCondition: result[0] < 0.05
      failureLimit: 2
      inconclusiveLimit: 3
      consecutiveErrorLimit: 2
      provider:
        prometheus:
          address: http://prometheus-server.prometheus.svc.cluster.local
          query: |
            sum(rate(hotrod_requests_total{
              namespace="{{args.namespace}}",
              rollouts_pod_template_hash="{{args.canary-hash}}",
              error="true"
            }[2m]))
            /
            sum(rate(hotrod_requests_total{
              namespace="{{args.namespace}}",
              rollouts_pod_template_hash="{{args.canary-hash}}"
            }[2m]))
    - name: latency-p95-lt-1s
      initialDelay: 90s
      interval: 10s
      count: 3
      successCondition: result[0] < 1000
      failureLimit: 2
      inconclusiveLimit: 3
      consecutiveErrorLimit: 2
      provider:
        prometheus:
          address: http://prometheus-server.prometheus.svc.cluster.local
          query: |
            histogram_quantile(0.95,
              sum by (le) (rate(traces_span_metrics_duration_milliseconds_bucket{
                hotrod_namespace="{{args.namespace}}",
                hotrod_pod_hash="{{args.canary-hash}}"
              }[2m]))
            )`,
        },
      ],
      takeaways: [
        "A traffic detection gate prevents idle canaries from being promoted without having handled real traffic.",
        "Argo Rollouts AnalysisTemplates can use trace-derived metrics from Spanmetrics as promotion gates, giving you observability-driven progressive delivery.",
      ],
    },
  ],
  furtherReading: [
    {
      title: "OpenTelemetry Collector documentation",
      url: "https://opentelemetry.io/docs/collector/",
    },
    {
      title: "Span Metrics Connector",
      url: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector",
    },
    {
      title: "Prometheus Exporter for OpenTelemetry Collector",
      url: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusexporter",
    },
    {
      title: "Argo Rollouts Analysis documentation",
      url: "https://argo-rollouts.readthedocs.io/en/stable/features/analysis/",
    },
    {
      title: "PromQL Basics",
      url: "https://prometheus.io/docs/prometheus/latest/querying/basics/",
    },
  ],
  completeSolution: {
    title: "Complete OpenTelemetry Collector Config",
    description:
      "OTLP/HTTP receiver added, metrics pipeline wired from Spanmetrics to Prometheus, Prometheus exporter configured on port 8889.",
    language: "yaml",
    code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: collector-config
  labels:
    app: collector
data:
  collector-config.yaml: |
    receivers:
      otlp:
        protocols:
          http:
            endpoint: 0.0.0.0:4318

    connectors:
      spanmetrics:
        dimensions:
          - name: hotrod.namespace
          - name: hotrod.pod.name
          - name: hotrod.pod.hash

    exporters:
      debug:
        verbosity: detailed
      otlp:
        endpoint: jaeger-collector.jaeger.svc.cluster.local:4317
        tls:
          insecure: true
      prometheus:
        endpoint: "0.0.0.0:8889"

    extensions:
      health_check:
        endpoint: 0.0.0.0:13133

    service:
      extensions: [health_check]
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [debug, otlp, spanmetrics]
        metrics:
          receivers: [spanmetrics]
          exporters: [debug, prometheus]`,
  },
  outro: {
    heading: "The Hyperspace Lane Is Open",
    html: "<p>The collector is receiving traces, converting them to metrics, and feeding them to Prometheus. The canary proved itself under real traffic before earning promotion. HotROD 1.76.0 is running in production, guided every step of the way by observability signals.</p><p>The routes between star systems are open again. See how other crews navigated the hyperspace configuration.</p>",
  },
};
