import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import deadReckoningIntermediate from "@/assets/diagrams/dead-reckoning-intermediate.svg";
import deadReckoningExpert from "@/assets/diagrams/dead-reckoning-expert.svg";
import type { Adventure } from "./types";

export const DEAD_RECKONING: Adventure = {
  id: "dead-reckoning",
  title: "Dead Reckoning",
  icon: "Compass",
  month: "JUL 2026",
  story: "The Grand Fleet's commission office is buried in complaints. Manifests are filed but nothing comes of them. Vessels that do sail arrive at port with the wrong cargo, and no one along the route can explain why. As the fleet's engineer, your mission is to restore order from keel to quayside and find out what the records are hiding.",
  metaDescription: "Fix a broken Backstage software template: debug the scaffolder steps that create a Gitea repository and register services in the catalog.",
  tags: ["Backstage", "Gitea", "Argo Events", "Argo Workflows", "Argo CD"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    aboutHtml: "<abbr data-title=\"Developer Relations\" tabindex=\"0\" aria-describedby=\"abbr-exp-1\">DevRel</abbr><span id=\"abbr-exp-1\" class=\"sr-only\">Developer Relations</span> at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
  },
  backstory: [
    "The Grand Fleet's commission office is buried in complaints. Manifests are filed but nothing comes of them. Vessels that do sail arrive at port with the wrong cargo, and no one along the route can explain why. As the fleet's engineer, your mission is to restore order from keel to quayside and find out what the records are hiding.",
  ],
  rewards: {
    deadline: "2026-07-28T23:59:00+01:00",
    eligibility: "Complete all levels and post your solution in the community before the deadline to be eligible.",
    tiers: [
      { label: "1st place", description: "50% voucher for a Linux Foundation certification" },
      { label: "Top 3", description: "Credly badge to showcase the achievement" },
    ],
    rankingNote: "Ranking is determined by total points across all three levels. Points per level are awarded by submission order within the active week (100 for the first valid solution, 95 for the second, and so on; late submissions still earn 60).",
    rankingRulesUrl: `${COMMUNITY_URL}/t/about-the-challenges-category/16`,
  },
  levels: [
    {
      id: "beginner",
      name: "Laying the Keel",
      difficulty: "Beginner",
      topics: ["Backstage", "Gitea"],
      audience: "Platform engineers, developers, and anyone curious about internal developer platforms and self-service scaffolding. No prior Backstage experience is needed, but familiarity with YAML and basic Git concepts will help.",
      learnings: [
        "How Backstage <a href=\"https://backstage.io/docs/features/software-templates/writing-templates\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">software templates</a> are structured: parameters, steps, and output",
        "How scaffolder <a href=\"https://backstage.io/docs/features/software-templates/builtin-actions\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">actions</a> work, such as <code>fetch:template</code>, <code>publish:gitea</code>, and <code>catalog:register</code>",
        "How the <a href=\"https://backstage.io/docs/features/software-catalog/life-of-an-entity\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">catalog registration</a> step connects a scaffolded repository to the Backstage catalog",
        "How to use Backstage's built-in <a href=\"https://backstage.io/docs/features/software-templates/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">template tooling</a>: the installed-actions browser and the Template Editor's live preview and dry-run",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Fdead-reckoning_beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "https://community.offon.dev/t/repair-a-broken-backstage-software-template-july-2026-adventure-beginner/1657",
      deadline: "2026-07-28T23:59:00+01:00",
      intro: [
        "Fix a broken Backstage software template so the commission office can register new vessels for service.",
      ],
      backstory: [
        "The commission office has been open for weeks, but nothing is being processed. Captains submit their manifests to register a new vessel, wait, and hear nothing back. No repository of record ever appears in the archives, and the vessel never makes it into the fleet registry.",
        "The commissioning procedure is supposed to be routine: take a captain's request, open a fresh set of records for the vessel in the archives, and enter the new ship into the registry so the rest of the yards can pick up the work. Somewhere in that procedure, a step is misconfigured, and every commission fails before it completes.",
        "Your mission: repair the vessel commissioning procedure so the office can register new vessels again, from the captain's request all the way to a proper entry in the registry.",
      ],
      objective: [
        "Commission a vessel end to end: file its repository at the location picked in the form (not a hardcoded path) so the new service is registered in the Backstage catalog",
        "In the commissioning form, choose the owning squadron from a picker of the catalog's squadrons, instead of typing it in by hand",
        "From the commissioning result, follow a working link to the new component in the catalog",
      ],
      architecture: [
        "<p>A Backstage software template mirrors the story's commissioning chain: it gathers input, then runs scaffolder steps that render the service's files (<code>fetch:template</code>), create and push a repository in Gitea (<code>publish:gitea</code>), and register the new component in the catalog (<code>catalog:register</code>). If one step is misconfigured, the whole commission fails.</p>",
        "<p>All infrastructure is pre-provisioned, with nothing to install. <strong>Gitea</strong> (the archives) runs in a Kubernetes  cluster on port 30110; <strong>Backstage</strong> (the commission office) runs alongside as a standalone instance on port 3000,  already wired to Gitea.</p>",
        "<p>Good news: you can trust the platform. The Backstage app and its configuration, Gitea, and the cluster are all set up correctly, so you can leave them be. The bug lives in the <strong>vessel commissioning template</strong>, and that is the only thing you need to touch.</p>",
        "<p>Note: this Backstage has been trimmed to just what the challenge needs (the catalog and the scaffolder), so it is deliberately lighter than a full install. If some Backstage page or feature you would expect is missing, that is why.</p>",
      ],
      toolbox: [
        { name: "Backstage", description: "The commission office. Run the template from Create, and repair it with the Template Editor's live preview and dry-run.", url: "https://backstage.io/docs/features/software-templates/" },
        { name: "Gitea", description: "The archives. Where a commissioned vessel's repository is created; check it to see what the template produced.", url: "https://docs.gitea.com/" },
      ],
      howToPlay: [
        { title: "Open the Commission Office", content: `<p>Start Backstage with <code>make backstage</code>. The first run compiles for ~30-60s; once it's up, the
commission office is available in your browser on port 3000. Leave it running: you'll see the
logs in that terminal, and can restart any time with Ctrl-C then <code>make backstage</code>.</p>` },
        { title: "Explore the Setup", content: `<p>In the office (Backstage), go to <strong>Create</strong>: you'll find the <strong>Commission a Vessel</strong> template.
Try running it: it won't get far, and that's expected. The template is broken, and your job is
to repair it.</p>
<p>While you're in <strong>Create</strong>, explore its tabs: they're genuinely useful when working on
templates, letting you browse the scaffolder's available actions and edit a template with a
live preview and a safe dry-run. Poke around and see what each one does.</p>
<p>Open <strong>Gitea</strong> on port 30110 (the archives) and the Backstage <strong>catalog</strong> to see what does,
and doesn't, make it through when you run the template.</p>` },
        { title: "Repair the Template", content: `<p>The only file you need to edit is the vessel commissioning template:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">backstage/templates/vessel-commissioning/template.yaml
</code></pre>
<p>Read it from top to bottom. Its three sections, <strong>parameters</strong> (the form), <strong>steps</strong> (the
commissioning procedure), and <strong>output</strong> (what the captain sees at the end), each have a
📖 documentation link above them. Compare each section against the <a href="#objective">Objective</a>:
the form, the steps, and the output each have something to put right.</p>
<p>Make your changes, try again, and once a vessel commissions cleanly, check your work.
Keep Backstage running in its terminal while you do: <code>make verify</code> commissions a test
vessel through it to confirm the repair.</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">make verify
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "Backstage Software Templates", url: "https://backstage.io/docs/features/software-templates/", description: "Overview of the scaffolder and how self-service templates work in Backstage" },
        { title: "Writing Templates", url: "https://backstage.io/docs/features/software-templates/writing-templates", description: "How a template's parameters, steps, and output fit together: the structure you'll be fixing" },
        { title: "Built-in Scaffolder Actions", url: "https://backstage.io/docs/features/software-templates/builtin-actions", description: "Reference for the actions a template can run, including publish and catalog registration steps" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "Laying the Keel: Fix a broken Backstage software template so the commission office can register new vessels for service.",
    },
    {
      id: "intermediate",
      name: "Sea Trial",
      difficulty: "Intermediate",
      topics: ["Backstage", "Gitea", "Argo Events", "Argo Workflows", "Argo CD"],
      audience: "Platform and <abbr data-title=\"Development and Operations\" tabindex=\"0\" aria-describedby=\"abbr-exp-2\">DevOps</abbr><span id=\"abbr-exp-2\" class=\"sr-only\">Development and Operations</span> engineers who have met these tools before and want to see how they fit together. You should be comfortable with Kubernetes, YAML, and reading a tool's logs and <abbr data-title=\"User Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-3\">UI</abbr><span id=\"abbr-exp-3\" class=\"sr-only\">User Interface</span>. Prior exposure to Backstage, Gitea, and the Argo projects helps, but the focus here is the integration between them, not any one tool.",
      learnings: [
        "How a Git webhook drives a workflow engine: Argo Events <a href=\"https://argoproj.github.io/argo-events/concepts/sensor/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">Sensors</a> turn a push into a <a href=\"https://argoproj.github.io/argo-events/tutorials/02-parameterization/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">parameterized</a> workflow run",
        "How <a href=\"https://argo-workflows.readthedocs.io/en/latest/walk-through/steps/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">Argo Workflows</a> runs a multi-step delivery pipeline, and the <a href=\"https://argo-workflows.readthedocs.io/en/latest/workflow-rbac/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">RBAC</a> its steps need",
        "How an Argo CD <a href=\"https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-SCM-Provider/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">ApplicationSet</a> auto-discovers repos and <a href=\"https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">syncs</a> them into the cluster",
        "How Backstage <a href=\"https://backstage.io/docs/features/software-catalog/well-known-annotations\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">annotations</a> tie a catalog entity to its live deployment status",
        "How to trace a silent failure across tools from each one's logs and UI",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Fdead-reckoning_intermediate%2Fdevcontainer.json&quickstart=1&machine=standardLinux32gb`,
      discussionUrl: "https://community.offon.dev/t/fix-a-broken-delivery-pipeline-july-2026-adventure-intermediate/1668",
      deadline: "2026-07-28T23:59:00+01:00",
      intro: [
        "Fix the broken integration points in the delivery pipeline so that commissioning a vessel in Backstage results in a running deployment.",
      ],
      backstory: [
        "The commission office is back in business: manifests are filed, repositories are created, and every new vessel is entered into the fleet registry. Yet the captains keep coming back with the same complaint. Their vessels are commissioned on paper, but they never actually sail.",
        "Between the commission office and open water lies a chain of yards, each meant to pick up where the last left off: a push to the archives should summon the shipyard, the shipyard should build the hull from the plans and hand it to the harbor master, and the harbor master should bring the finished vessel into formation. Somewhere along that chain the handoffs are misconfigured, and every vessel stalls before it reaches the water.",
        "Your mission: trace a single commission from the office all the way to open water, find every point where the chain is broken, and repair the integrations so that commissioning a vessel results in a running ship you can reach directly.",
      ],
      objective: [
        "A commissioned vessel is fully delivered: its code and deployment repositories exist, its delivery workflow has completed, its Argo CD Application is synced, and its service is running in the cluster",
        "See the vessel's live deployment status on its page in Backstage",
        "The vessel's service is reachable directly and reports itself seaworthy",
      ],
      architecture: [
        "<p>Commissioning a vessel kicks off a delivery pipeline that spans several tools. Backstage files two repositories in Gitea (the vessel's code and its deployment manifests). A push to the code repository fires a Gitea webhook into <strong>Argo Events</strong>, whose Sensor submits an <strong>Argo Workflow</strong>. That workflow clones the code, builds a container image and pushes it to Gitea's registry, then stamps the new image tag onto the deployment repository. <strong>Argo CD</strong> discovers the deployment repository and syncs it into the cluster as a running Deployment and Service. The diagram below shows the full chain.</p>",
        "<p>Each vessel's page in Backstage is your cockpit: it shows the vessel's live Argo CD sync and health and its delivery workflows, so you can watch a commission progress and spot where it stalls. Alongside it, use each tool's own view: Gitea's repositories and a webhook's Recent Deliveries, the Argo Workflows UI (port 30113), and the Argo CD UI (port 30100).</p>",
        "<p>You edit two things: the delivery pipeline manifests under <code>platform/</code> (<code>argo-events/</code>, <code>argo-workflows/</code>, <code>argocd/</code>) and the vessel commissioning template under <code>backstage/templates/vessel-commissioning-template/</code>.</p>",
        "<p>This level runs a real container build on a Kubernetes cluster. It works on the default Codespace, but if you hit resource problems or the pipeline feels sluggish, upgrade to a larger (<strong>4-core / 16 GB</strong>) machine. Either way, give the pipeline a few minutes after commissioning: the first build pulls its base images before an image ever reaches the cluster.</p>",
        `<blockquote>
<p>A quick translation from the story to the tools: a <strong>vessel</strong> is a small service you deploy, made up of its code repository, its deployment manifests, and the running Deployment and Service in the cluster. The <strong>commission office</strong> is Backstage, the <strong>archives</strong> are Gitea, the <strong>shipyard</strong> is Argo Workflows, and the <strong>harbor master</strong> is Argo CD; Argo Events is the lookout that summons the shipyard when new code is filed. A vessel "reaching open water" just means a commissioned service made it all the way to a running, reachable deployment.</p>
</blockquote>`,
      ],
      architectureDiagram: deadReckoningIntermediate,
      diagramAlt: "Left-to-right delivery pipeline: Backstage creates the repositories, Argo Events triggers the CI build, Argo Workflows builds the image and updates the tag, Argo CD syncs the deployment, and the vessel's app is up and running.",
      toolbox: [
        { name: "Backstage", description: "The commission office and your cockpit (port 3000). Commission a vessel from Create, then watch its page for the vessel's Argo CD status and delivery workflows.", url: "https://backstage.io/docs/features/software-catalog/" },
        { name: "Gitea", description: "The archives (port 30112). Holds each vessel's code and deployment repositories, the org webhook, and the container registry. A webhook's Recent Deliveries shows whether a push was delivered.", url: "https://docs.gitea.com/" },
        { name: "Argo Workflows", description: "The shipyard (port 30113). Runs the multi-step build-and-deliver workflow; its UI shows each run, step by step, and why a step failed.", url: "https://argo-workflows.readthedocs.io/en/latest/" },
        { name: "Argo CD", description: "The harbor master (port 30100). Discovers deployment repositories and reconciles them into the cluster; its UI shows each vessel's sync and health.", url: "https://argo-cd.readthedocs.io/en/stable/" },
      ],
      howToPlay: [
        { title: "Open the Commission Office", content: `<p>Start Backstage with <code>make backstage</code>. The first run compiles for ~30-60s; once it's up, the commission
office is available in your browser on port 3000. Leave it running in that terminal; restart any time with
Ctrl-C then <code>make backstage</code>.</p>
<p>The rest of the platform (Gitea, Argo Events, Argo Workflows, Argo CD) is already running in the cluster.</p>` },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 3000:</strong> Backstage. The commission office and your cockpit. Start it with <code>make backstage</code>, then commission vessels and watch each one's page. Signs in as a guest, no credentials needed.</li>
<li><strong>Port 30112:</strong> Gitea (admin / a-super-secure-password). The archives: each vessel's code and deployment repositories, the org webhook (Recent Deliveries), and the container registry.</li>
<li><strong>Port 30113:</strong> Argo Workflows. The shipyard: the delivery workflow runs, step by step, with per-step logs. No sign-in required.</li>
<li><strong>Port 30100:</strong> Argo CD (readonly / a-super-secure-password). The harbor master: each vessel's Application, sync status, and health.</li>
</ul>` },
        { title: "Trace a Commission", content: `<p>In Backstage, go to <strong>Create</strong> and run the <strong>Commission a Vessel</strong> template. It will commission cleanly, but
the vessel won't sail. That's expected: your job is to find out why.</p>
<p>Open the new vessel's page in the catalog. It's your cockpit: it shows the vessel's Argo CD deployment status
and its delivery workflows. From there, follow the chain outward and see how far each commission gets:</p>
<ul>
<li><strong>Gitea</strong> (port 30112): were both repositories created? Did the push reach the pipeline (check a webhook's
Recent Deliveries)?</li>
<li><strong>Argo Workflows</strong> (port 30113): did a build run for this vessel, and if it failed, what does the failing
step report?</li>
<li><strong>Argo CD</strong> (port 30100): is there an Application for the vessel, and is it synced and healthy?</li>
</ul>
<p>Each tool shows you one handoff. Follow the data from one to the next until you find where it stalls.</p>` },
        { title: "Repair the Integrations", content: `<p>The breaks live in the delivery pipeline manifests and the commissioning template:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-text">platform/argo-events/
platform/argo-workflows/
platform/argocd/
backstage/templates/vessel-commissioning-template/
</code></pre>
<p>Read the relevant file top to bottom and compare it against what you observed. After editing a <code>platform/</code>
manifest, re-apply it with <code>make apply</code>. Because the pipeline is triggered by a push, test a fix by
commissioning a fresh vessel (or redelivering the push from Gitea's Recent Deliveries). Changes to the
template take effect on the next vessel you commission.</p>
<p>When you think a vessel can sail end to end, check your work. <code>make verify</code> grades the most recently
commissioned vessel stage by stage and reports the first place the pipeline runs aground:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">make verify
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "Backstage: Well-known Annotations", url: "https://backstage.io/docs/features/software-catalog/well-known-annotations", description: "How annotations on a catalog entity link it to external systems shown on its page" },
        { title: "Argo Events: Sensor", url: "https://argoproj.github.io/argo-events/concepts/sensor/", description: "How a Sensor listens for events and triggers actions, and how it shapes a trigger from the event's data" },
        { title: "Argo Workflows: Steps", url: "https://argo-workflows.readthedocs.io/en/latest/walk-through/steps/", description: "How a workflow chains multiple steps and passes data between them" },
        { title: "Argo Workflows: Workflow RBAC", url: "https://argo-workflows.readthedocs.io/en/latest/workflow-rbac/", description: "What permissions a workflow's service account needs for its steps to run and report status" },
        { title: "Argo CD: SCM Provider Generator", url: "https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-SCM-Provider/", description: "How an ApplicationSet auto-discovers repositories and turns each into an Application" },
        { title: "Argo CD: Automated Sync", url: "https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/", description: "How Argo CD reconciles an Application's desired state into the cluster" },
      ],
      verification: {
        command: "make verify",
        description: "Grades the most recently commissioned vessel stage by stage, from its repositories through the delivery workflow to a synced Argo CD Application and a reachable service, and reports the first place the pipeline runs aground.",
      },
      metaDescription: "Sea Trial: Fix the broken integration points in the delivery pipeline so that commissioning a vessel in Backstage results in a running deployment.",
    },
    {
      id: "expert",
      name: "The Chronometer",
      difficulty: "Expert",
      topics: ["Backstage", "Argo Workflows", "Argo CD", "OpenTelemetry", "Jaeger"],
      audience: "Platform and DevOps engineers who already know how the delivery pipeline fits together and want to see how a distributed trace ties it into one story. You should be comfortable with Kubernetes, YAML, and reading a tool's logs and UI. Prior exposure to OpenTelemetry, trace context propagation, and a trace viewer like Jaeger helps, but the focus here is using a trace to reason across service boundaries, not any one tool.",
      learnings: [
        "How trace context crosses an asynchronous boundary with no call chain: a commission carries its <a href=\"https://www.w3.org/TR/trace-context/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">W3C traceparent</a> to a push-triggered pipeline, so its spans <a href=\"https://opentelemetry.io/docs/concepts/context-propagation/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">continue the same trace</a> instead of starting a new one",
        "Why a <a href=\"https://opentelemetry.io/docs/concepts/signals/traces/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">distributed trace</a> reveals what per-tool logs cannot: the value that flowed through each step, so a fault surfaces where the data diverges",
        "How to read that trace in <a href=\"https://www.jaegertracing.io/docs/latest/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-describedby=\"new-tab-hint\">Jaeger</a> to localise a fault to a single service by following one attribute across the whole voyage",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Fdead-reckoning_expert%2Fdevcontainer.json&quickstart=1&machine=standardLinux32gb`,
      discussionUrl: "https://community.offon.dev/t/trace-a-silent-failure-across-your-delivery-pipeline-july-2026-adventure-expert/1671",
      deadline: "2026-07-28T23:59:00+01:00",
      intro: [
        "Repair the fleet's broken navigation log, then use the complete trace it produces to find why vessels arrive carrying the wrong cargo.",
      ],
      backstory: [
        "Every commission the office issues is supposed to leave one clean line in the navigation log: the moment a captain fills in the papers, the yards that build and deliver the vessel, and the harbor master bringing it into formation, all recorded as a single voyage you can read end to end. Read the log and you know exactly what happened to any vessel, and when.",
        "Lately the log lies. It records the commission office plainly enough, then goes dark the instant a vessel leaves for the yards: the shipyard's and harbor master's work never appears on the same line. And at the far end of the voyage, captains keep signing for the wrong cargo, salt-pork where citrus was ordered, though every yard along the route reported a clean, successful run. No single tool shows anything wrong.",
        "Your mission: repair the log so a commission reads as one unbroken voyage again, from the office all the way to open water, then use that complete picture to find where the cargo goes astray, and set it right.",
      ],
      objective: [
        "Every commission appears in the navigation log (Jaeger) as a single, connected trace, unbroken from the commission office (Backstage) through the shipyard (Argo Workflows) and the harbor master (Argo CD)",
        "Every vessel sails carrying the provisions it was commissioned to carry",
      ],
      architecture: [
        "<p>This level adds a tracing overlay to the Sea Trial delivery pipeline: every stage now reports spans to an <strong>OpenTelemetry Collector</strong>, which forwards them to <strong>Jaeger</strong>. The commission office opens the trace and hands its context to the pipeline, so one commission should read as a single connected voyage: <code>commission &#x3C;vessel></code> -> <code>enter parameters</code> and <code>scaffold repos</code> (Backstage) -> <code>ci pipeline</code> (Argo Workflows) -> <code>rollout</code> (Argo CD).</p>",
        "<p>The cargo rides that trace at three checkpoints, so you see not just <em>that</em> it is wrong but <em>where</em> it changed: <code>provisions.ordered</code> (root span, what was selected), <code>provisions.declared</code> (rollout span, what the deployment sets), and <code>provisions.reported</code> (rollout span, what the running vessel says it carries). In a healthy voyage all three agree.</p>",
        "<p>Your repairs live in the vessel commissioning template under <code>backstage/templates/vessel-commissioning-template/</code> (<code>template.yaml</code> and the files under <code>content/</code>). Everything else, the <code>platform/</code> manifests and the Backstage tracing setup, is working: read it to see how the trace is carried out to sea, but you won't need to change it.</p>",
        "<p>This level runs a real container build, so your Codespace uses a larger (<strong>4-core / 16 GB</strong>) machine. Give the pipeline a few minutes after commissioning; the delivery spans land in Jaeger once the rollout completes.</p>",
        `<blockquote>
<p>A quick translation from the story to the tools: a <strong>vessel</strong> is a small service you deploy; its <strong>cargo</strong> (<strong>provisions</strong>) is a value it is commissioned to carry, set in its deployment and reported by the running service. The <strong>commission office</strong> is Backstage, the <strong>shipyard</strong> is Argo Workflows, the <strong>harbor master</strong> is Argo CD, and the <strong>navigation log</strong> is Jaeger. A commission's <strong>voyage</strong> is the single distributed trace that should span all of them.</p>
</blockquote>`,
      ],
      architectureDiagram: deadReckoningExpert,
      diagramAlt: "The delivery pipeline runs left to right across the top: Backstage creates the repositories, Argo Events triggers the CI build, Argo Workflows builds the image and updates the tag, Argo CD syncs the deployment, and the vessel's app is up and running. A W3C traceparent thread runs through the pipeline. Backstage, Argo Workflows, and Argo CD each report spans down to the OpenTelemetry Collector, which feeds Jaeger, where a single commission appears as one connected trace: a Commission Vessel root span over Backstage, Argo Workflows, and Argo CD spans.",
      toolbox: [
        { name: "Jaeger", description: "The navigation log (port 30103). Shows each commission's trace; search by service <code>backstage</code> and operation <code>commission &#x3C;vessel></code> to open a voyage, then read its spans and their attributes.", url: "https://www.jaegertracing.io/docs/latest/" },
        { name: "Backstage", description: "The commission office and your cockpit (port 3000). Commission a vessel from Create; its page carries a Voyage log card that links to the trace.", url: "https://backstage.io/docs/features/software-templates/" },
        { name: "Argo Workflows", description: "The shipyard (port 30113). Runs the multi-step build-and-deliver workflow and emits the <code>ci pipeline</code> spans.", url: "https://argo-workflows.readthedocs.io/en/latest/" },
        { name: "Argo CD", description: "The harbor master (port 30100). Reconciles each vessel into the cluster and emits the <code>rollout</code> span.", url: "https://argo-cd.readthedocs.io/en/stable/" },
        { name: "OpenTelemetry Collector", description: "The signal station every component reports spans to; it forwards them on to Jaeger. Part of the working tracing setup, here to read, not to change.", url: "https://opentelemetry.io/docs/collector/" },
      ],
      howToPlay: [
        { title: "Open the Commission Office", content: `<p>Start Backstage with <code>make backstage</code>. The first run compiles for ~30-60s; once it's up, the commission
office is available in your browser on port 3000. Leave it running in that terminal; restart any time with
Ctrl-C then <code>make backstage</code>.</p>
<p>The rest of the platform (Gitea, Argo Events, Argo Workflows, Argo CD, the OpenTelemetry Collector, and Jaeger)
is already running in the cluster.</p>` },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 3000:</strong> Backstage. The commission office and your cockpit. Start it with <code>make backstage</code>, then commission vessels. Signs in as a guest, no credentials needed.</li>
<li><strong>Port 30103:</strong> Jaeger. The navigation log: each commission's distributed trace, across Backstage, Argo Workflows, and Argo CD. No sign-in required.</li>
<li><strong>Port 30112:</strong> Gitea (admin / a-super-secure-password). The archives: each vessel's code and deployment repositories and the container registry.</li>
<li><strong>Port 30113:</strong> Argo Workflows. The shipyard: the delivery workflow runs, step by step, with per-step logs. No sign-in required.</li>
<li><strong>Port 30100:</strong> Argo CD (readonly / a-super-secure-password). The harbor master: each vessel's Application, sync status, and health.</li>
</ul>` },
        { title: "Sail a Commission and Read the Log", content: `<p>In Backstage, go to <strong>Create</strong> and run the <strong>Commission a Vessel</strong> template. Pick a cargo you'll remember (say
<strong>Citrus</strong>), and let the vessel sail. Delivery still works, but the records don't add up. You have two
instruments to check what really happened:</p>
<ul>
<li><strong>Greet the vessel.</strong> Once it's running, <code>make ahoi</code> reports the cargo it's actually carrying.
Is it what you ordered?</li>
<li><strong>Open the log.</strong> In <strong>Jaeger</strong> (port 30103), search service <code>backstage</code>, operation <code>commission &#x3C;vessel></code>,
and open the trace. Read it from the commission office outward: how much of the voyage actually reached the
log?</li>
</ul>
<p>The trace is your instrument for both. It carries the cargo along the voyage (<code>provisions.ordered</code> ->
<code>provisions.declared</code> -> <code>provisions.reported</code>), so once the log reads true end to end, Jaeger is where you
follow the cargo from order to arrival and find where it goes astray.</p>` },
        { title: "Repair the Log, Then the Cargo", content: `<p>Both repairs live in the vessel commissioning template:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-text">backstage/templates/vessel-commissioning-template/
</code></pre>
<p>Start with the log. Read how a commission carries its trace context out to the pipeline, and how the pipeline
picks it back up off the push it reacts to; the two need to line up on the same commit. With the voyage whole,
the trace shows the cargo at each checkpoint (<code>provisions.ordered</code> -> <code>provisions.declared</code> ->
<code>provisions.reported</code>): follow it and let it tell you which stage the cargo survives and which one it doesn't.</p>
<p>Test a fix by commissioning a fresh vessel and watching it sail. If you edited <code>template.yaml</code>, reload it into
Backstage first so the next commission picks up your change:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">make reload-template
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "W3C Trace Context", url: "https://www.w3.org/TR/trace-context/", description: "The traceparent format that carries a trace across service boundaries" },
        { title: "OpenTelemetry: Context Propagation", url: "https://opentelemetry.io/docs/concepts/context-propagation/", description: "How spans in different processes are stitched into one trace by passing context between them" },
        { title: "OpenTelemetry: Traces", url: "https://opentelemetry.io/docs/concepts/signals/traces/", description: "What a trace and its spans are, and why they capture causal, data-carrying detail logs don't" },
        { title: "Jaeger: Documentation", url: "https://www.jaegertracing.io/docs/latest/", description: "Searching for and reading distributed traces across services" },
        { title: "Backstage: Software Templates", url: "https://backstage.io/docs/features/software-templates/", description: "How a scaffolder template runs its steps and passes values between them" },
      ],
      verification: {
        command: "make verify",
        description: "Grades the most recently commissioned vessel against the two end-states: its commission is one connected trace in Jaeger, and the running vessel reports the cargo its deployment declares. Each check reports on its own, so you see which half of the log still reads false.",
      },
      metaDescription: "The Chronometer: Repair the fleet's broken navigation log, then use the complete trace it produces to find why vessels arrive carrying the wrong cargo.",
    },
  ],
};
