import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const THE_AI_OBSERVATORY: Adventure = {
  id: "the-ai-observatory",
  title: "The AI Observatory",
  month: "FEB 2026",
  story: "Investigate a mysterious bandwidth anomaly at a remote research station by instrumenting its AI system with OpenTelemetry, OpenLLMetry, and Jaeger.",
  tags: ["OpenTelemetry", "OpenLLMetry", "Jaeger", "Prometheus", "Python"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    about: "DevRel at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
  },
  backstory: [
    "You are stationed at Perimeter Alpha, a research outpost on the newly discovered planet HB-7742. The station is run by HubSystem, a central AI that manages everything from life support to data analysis.",
    "Recently, the station's bandwidth usage has spiked to 847% above baseline, but no one knows why. As the systems engineer, it's your job to instrument the AI, trace its activities, and uncover the root cause of the anomaly.",
    "Your mission: bring visibility to the station's AI and solve the mystery.",
  ],
  levels: [
    {
      id: "beginner",
      name: "Calibrating the Lens",
      difficulty: "Beginner",
      topics: ["OpenTelemetry", "OpenLLMetry", "Jaeger"],
      learnings: [
        "Instrument Python AI apps with OpenLLMetry",
        "Analyze traces in Jaeger",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F03-the-ai-observatory_01-beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/instrument-your-first-llm-adventure-03-beginner-is-live/865/8`,
      deadline: "8 March 2026 at 23:59 CET",
      intro: [
        "Something is eating 847% of your station's bandwidth and nobody knows what. Instrument HubSystem with OpenLLMetry, send traces to the OpenTelemetry Collector, and use Jaeger to uncover what the AI is doing behind the scenes.",
      ],
      backstory: [
        "You're a researcher stationed at Perimeter Alpha, a remote research outpost on the newly discovered planet HB-7742. Your team of six scientists is protected by a single SecUnit, assigned by the corporation to ensure your safety during the survey mission. All station queries flow through HubSystem, the central AI that manages everything from data analysis to status reports.",
        "Three weeks in, you notice something odd in your morning diagnostics: communication module usage at 847% above baseline. Nobody's streaming. Nobody's running large data transfers. The planet surveys are on schedule. So what's consuming all that bandwidth?",
        "As the station's systems engineer, you decide to investigate. Time to instrument HubSystem with OpenTelemetry and find out what's really going on.",
        "Credits: The characters of this adventure are borrowed from the Murderbot Diaries series by Martha Wells, a brilliant series that is funny, action-packed, and surprisingly heartwarming. It follows a security unit that hacked its own governor module and now just wants to be left alone to watch media, but keeps getting pulled into human nonsense.",
      ],
      objective: [
        "Enable OpenTelemetry instrumentation for HubSystem using OpenLLMetry",
        "Send traces to the OpenTelemetry Collector at http://localhost:30107",
        "Analyze traces in Jaeger to find what causes the high bandwidth usage",
        "Provide the correct answer in quiz.txt",
      ],
      architecture: [
        "All AI and observability infrastructure (Ollama, OpenTelemetry Collector, Jaeger) runs inside Kubernetes, while HubSystem runs as a local Python application outside the cluster.",
        "This setup has two benefits: it lets you focus on instrumentation without wrestling with containers or Kubernetes deployments when updating the app, and it gives you fast iteration. Edit the Python code, run it, and see traces in Jaeger immediately. No build or deploy cycle.",
      ],
      toolbox: [
        { name: "python", description: "programming language used for the HubSystem application" },
        { name: "kubectl", description: "Kubernetes CLI for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal UI for managing and inspecting your cluster", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", body: "Wait ~10 minutes for all infrastructure to initialize." },
        { title: "Open Jaeger", body: "Open the Ports tab, find Jaeger at port 30103. This is where you will analyze the traces sent by HubSystem." },
        { title: "Instrument the App", body: `The application code is in \`./hubsystem.py\`. Add OpenTelemetry instrumentation using OpenLLMetry. The OTel
Collector and Jaeger are already configured correctly; you only need to instrument the app. You do not need to
interact with Kubernetes directly. The cluster is already running, so focus on the Python code.` },
        { title: "Run and Investigate", body: `Run the application, interact with the AI to generate traces, then check Jaeger:

\`\`\`sh
make hubsystem
\`\`\`` },
        { title: "Answer the Quiz", body: `Find the trace responsible for the high bandwidth usage and inspect its attributes to answer \`quiz.txt\`.` },
      ],
      helpfulLinks: [
        { label: "OpenLLMetry SDK for Python", url: "https://traceloop.com/docs/openllmetry/getting-started-python" },
        { label: "Jaeger documentation", url: "https://www.jaegertracing.io/docs/latest/" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
    },
    {
      id: "intermediate",
      name: "The Distracted Pilot",
      difficulty: "Intermediate",
      topics: ["OpenTelemetry", "OpenLLMetry", "Jaeger", "Prometheus"],
      learnings: [
        "Instrument RAG pipelines with OpenLLMetry",
        "Create custom OpenTelemetry metrics in Python",
        "Write PromQL queries & recording rules in Prometheus",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F03-the-ai-observatory_02-intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/instrument-debug-a-rag-pipeline-adventure-03-intermediate-is-live/936/2`,
      deadline: "8 March 2026 at 23:59 CET",
      intro: [
        "ART's RAG pipeline is retrieving entertainment data instead of navigation coordinates and won't calculate your jump. Instrument the full retrieval pipeline with OpenLLMetry, build a custom OTel metric to quantify the distraction, and write a Prometheus recording rule to prove it.",
      ],
      backstory: [
        "You're a rogue SecUnit who just escaped from Preservation Station after being identified. A researcher helped you flee aboard the Perihelion, a university research vessel with a very opinionated AI.",
        "The ship's AI agreed to help you disappear. You've nicknamed it ART. The plan: jump to RaviHyral, lay low, and figure out your next move. Except ART was supposed to have the jump coordinates ready an hour ago.",
        `You ping the ship's AI through your internal comm.

SecUnit: "ART. Jump coordinates. Now."

ART: "I'm multitasking. The coordinates are... being compiled."

That's not normal. ART is never vague. You access the ship's diagnostic systems (something you're not supposed to be able to do, but ART hasn't locked you out yet).`,
        "Your mission: diagnose ART's distraction using OpenTelemetry and fix the navigation system before you miss your jump.",
        "Credits: The characters of this adventure are borrowed from the Murderbot Diaries series by Martha Wells, a brilliant series that is funny, action-packed, and surprisingly heartwarming. It follows a security unit that hacked its own governor module and now just wants to be left alone to watch media, but keeps getting pulled into human nonsense.",
      ],
      objective: [
        "Instrument the full RAG pipeline with OpenLLMetry (add a span named rag.context_assembly with attribute context.categories)",
        "Implement a custom metric art.rag.retrieval.count to track how often ART retrieves entertainment vs navigation data",
        "Create a Prometheus recording rule to calculate ART's Distraction Ratio",
        "Restore the navigation system so ART successfully calculates jump coordinates to RaviHyral",
      ],
      architecture: [
        "The ART Pilot System runs as a local Python application outside Kubernetes, using a RAG (Retrieval-Augmented Generation) architecture. AI infrastructure (Ollama for LLM, Qdrant for vector storage) and observability tools (OpenTelemetry Collector, Jaeger, Prometheus) run inside Kubernetes.",
        "This setup lets you focus on observability patterns: edit Python code, run it, and see traces and metrics immediately without a build or deploy cycle.",
      ],
      toolbox: [
        { name: "python", description: "programming language used for the ART application" },
        { name: "kubectl", description: "Kubernetes CLI for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal UI for managing and inspecting your cluster", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", body: "Wait ~15 minutes for all infrastructure to initialize." },
        { title: "Access Observability Tools", body: "Open the Ports tab. Prometheus at port 30102 helps you explore available metrics and test PromQL queries. Jaeger at port 30103 shows distributed traces from ART so you can verify that tracing is working end-to-end." },
        { title: "Instrument and Configure", body: `The application code is in \`./art.py\`. Instrument it with OpenLLMetry and add the custom metric. The Prometheus recording rules are in \`./manifests/prometheus-rule.yaml\`. After changing the rule file, apply it to the cluster:

\`\`\`sh
make apply
\`\`\`` },
        { title: "Generate Traffic", body: `Run the application to interact with ART ("Calculate jump"), or generate continuous traffic for your metric graphs:

\`\`\`sh
make art
# or for continuous traffic:
make traffic
\`\`\`` },
        { title: "Fix the Navigation", body: "Verify traces in Jaeger and the recording rule in Prometheus. Fix the navigation system so ART returns jump coordinates to RaviHyral." },
      ],
      helpfulLinks: [
        { label: "OpenLLMetry SDK for Python", url: "https://traceloop.com/docs/openllmetry/getting-started-python" },
        { label: "OpenTelemetry Python metrics", url: "https://opentelemetry.io/docs/languages/python/instrumentation/#metrics" },
        { label: "Prometheus recording rules", url: "https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/" },
        { label: "Qdrant filtering", url: "https://qdrant.tech/documentation/concepts/filtering/" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
    },
    {
      id: "expert",
      name: "The Noise Filter",
      difficulty: "Expert",
      topics: ["OpenTelemetry", "OpenLLMetry", "Jaeger"],
      learnings: [
        "OpenTelemetry GenAI semantic conventions",
        "Tail sampling in the OTel Collector",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F03-the-ai-observatory_03-expert%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/reduce-telemetry-noise-adventure-03-expert-is-live/999/1`,
      deadline: "8 March 2026 at 23:59 CET",
      intro: [
        "ART is flooding Jaeger with 40,000 non-standard spans an hour. Fix the chat span to follow OpenTelemetry GenAI semantic conventions with proper token usage attributes, then configure tail sampling in the Collector to keep only traces that contain errors or exceed 5 seconds.",
      ],
      backstory: [
        "You made it to RaviHyral. The Perihelion docked at Outpost Verada, a small independent research station run by a loose collective of academics who agreed to look the other way. In exchange, ART offered to share its observability data with the station's monitoring team.",
        `That was three hours ago. Now the station's lead engineer is at your docking port, looking annoyed.

Engineer: "Your ship's AI is flooding our Jaeger instance. Do you have any idea how many spans it's generating? We can't find anything in there."

SecUnit: "ART."

ART: "Comprehensive telemetry is a feature."

Engineer: "It's 40,000 spans an hour. Every healthy query. Every token. It doesn't even follow conventions. We only care about failures and anomalies, the things that actually need attention."

SecUnit: "ART. Fix it."

ART: "...Fine."`,
        "The engineer hands you access to the collector config and the application code, then walks away. Two problems to fix. ART's spans don't follow OTel GenAI semantic conventions, and the collector is forwarding everything.",
        "Credits: The characters of this adventure are borrowed from the Murderbot Diaries series by Martha Wells, a brilliant series that is funny, action-packed, and surprisingly heartwarming. It follows a security unit that hacked its own governor module and now just wants to be left alone to watch media, but keeps getting pulled into human nonsense.",
      ],
      objective: [
        "Fix ART's chat span to follow OpenTelemetry GenAI semantic conventions, including token usage attributes",
        "Configure tail sampling in the OpenTelemetry Collector to keep only traces that contain errors or take longer than 5 seconds",
      ],
      architecture: [
        "Same setup as the intermediate level: the ART Pilot System runs as a local Python application outside Kubernetes with a RAG architecture. AI infrastructure (Ollama, Qdrant) and observability tools (OpenTelemetry Collector, Jaeger) run inside Kubernetes.",
      ],
      toolbox: [
        { name: "python", description: "programming language used for the ART application" },
        { name: "kubectl", description: "Kubernetes CLI for interacting with the cluster", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kubens", description: "fast way to switch between Kubernetes namespaces", url: "https://github.com/ahmetb/kubectx" },
        { name: "k9s", description: "terminal UI for managing and inspecting your cluster", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Wait for Infrastructure", body: "Wait ~15 minutes for all infrastructure to initialize." },
        { title: "Open Jaeger", body: "Open the Ports tab, find Jaeger at port 30103. Verify your spans look correct and that sampling works as expected." },
        { title: "Fix Instrumentation and Sampling", body: `Fix two things:

1. The application code in \`./art.py\`: update the \`chat\` span to follow OpenTelemetry GenAI semantic conventions, including token usage attributes.
2. The collector config in \`./manifests/otel-collector-config.yaml\`: configure tail sampling to keep only traces that contain errors or take longer than 5 seconds.` },
        { title: "Apply and Test", body: `After changing \`art.py\`, restart traffic to pick up new instrumentation. After changing the collector config, apply it:

\`\`\`sh
kubectl apply -f manifests/otel-collector-config.yaml -n otel
kubectl rollout restart deployment/collector -n otel
\`\`\`

Then generate traces:

\`\`\`sh
make traffic
\`\`\`

Verify in Jaeger that spans follow conventions and only errors and slow traces appear.` },
      ],
      helpfulLinks: [
        { label: "OpenTelemetry GenAI semantic conventions", url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/" },
        { label: "OpenTelemetry Python: recording exceptions", url: "https://opentelemetry.io/docs/languages/python/instrumentation/#record-exceptions" },
        { label: "OTel Collector tail sampling processor", url: "https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor" },
        { label: "Python contextlib.contextmanager", url: "https://docs.python.org/3/library/contextlib.html#contextlib.contextmanager" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
    },
  ],
};
