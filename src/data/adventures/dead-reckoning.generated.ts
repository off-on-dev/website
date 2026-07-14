import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const DEAD_RECKONING: Adventure = {
  id: "dead-reckoning",
  title: "Dead Reckoning",
  month: "JUL 2026",
  story: "The Grand Fleet's commission office is buried in complaints. Manifests are filed but nothing comes of them. Vessels that do sail arrive at port with the wrong cargo, and no one along the route can explain why. As the fleet's engineer, your mission is to restore order from keel to quayside and find out what the records are hiding.",
  metaDescription: "Fix a broken Backstage software template: debug the scaffolder steps that create a Gitea repository and register services in the catalog.",
  tags: ["Backstage", "Gitea", "Argo Events", "Argo Workflows", "Argo CD"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    aboutHtml: "DevRel at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
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
  upcomingLevels: [
    { name: "Expert", difficulty: "Expert" },
  ],
  levels: [
    {
      id: "beginner",
      name: "Laying the Keel",
      difficulty: "Beginner",
      topics: ["Backstage", "Gitea"],
      audience: "Platform engineers, developers, and anyone curious about internal developer platforms and self-service scaffolding. No prior Backstage experience is needed, but familiarity with YAML and basic Git concepts will help.",
      learnings: [
        "How Backstage <a href=\"https://backstage.io/docs/features/software-templates/writing-templates\" target=\"_blank\" rel=\"noopener noreferrer\">software templates<span class=\"sr-only\"> (opens in new tab)</span></a> are structured: parameters, steps, and output",
        "How scaffolder <a href=\"https://backstage.io/docs/features/software-templates/builtin-actions\" target=\"_blank\" rel=\"noopener noreferrer\">actions<span class=\"sr-only\"> (opens in new tab)</span></a> work, such as <code>fetch:template</code>, <code>publish:gitea</code>, and <code>catalog:register</code>",
        "How the <a href=\"https://backstage.io/docs/features/software-catalog/life-of-an-entity\" target=\"_blank\" rel=\"noopener noreferrer\">catalog registration<span class=\"sr-only\"> (opens in new tab)</span></a> step connects a scaffolded repository to the Backstage catalog",
        "How to use Backstage's built-in <a href=\"https://backstage.io/docs/features/software-templates/\" target=\"_blank\" rel=\"noopener noreferrer\">template tooling<span class=\"sr-only\"> (opens in new tab)</span></a>: the installed-actions browser and the Template Editor's live preview and dry-run",
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
      audience: "Platform and DevOps engineers who have met these tools before and want to see how they fit together. You should be comfortable with Kubernetes, YAML, and reading a tool's logs and UI. Prior exposure to Backstage, Gitea, and the Argo projects helps, but the focus here is the integration between them, not any one tool.",
      learnings: [
        "How a Git webhook drives a workflow engine: Argo Events <a href=\"https://argoproj.github.io/argo-events/concepts/sensor/\" target=\"_blank\" rel=\"noopener noreferrer\">Sensors<span class=\"sr-only\"> (opens in new tab)</span></a> turn a push into a <a href=\"https://argoproj.github.io/argo-events/tutorials/02-parameterization/\" target=\"_blank\" rel=\"noopener noreferrer\">parameterized<span class=\"sr-only\"> (opens in new tab)</span></a> workflow run",
        "How <a href=\"https://argo-workflows.readthedocs.io/en/latest/walk-through/steps/\" target=\"_blank\" rel=\"noopener noreferrer\">Argo Workflows<span class=\"sr-only\"> (opens in new tab)</span></a> runs a multi-step delivery pipeline, and the <a href=\"https://argo-workflows.readthedocs.io/en/latest/workflow-rbac/\" target=\"_blank\" rel=\"noopener noreferrer\">RBAC<span class=\"sr-only\"> (opens in new tab)</span></a> its steps need",
        "How an Argo CD <a href=\"https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-SCM-Provider/\" target=\"_blank\" rel=\"noopener noreferrer\">ApplicationSet<span class=\"sr-only\"> (opens in new tab)</span></a> auto-discovers repos and <a href=\"https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/\" target=\"_blank\" rel=\"noopener noreferrer\">syncs<span class=\"sr-only\"> (opens in new tab)</span></a> them into the cluster",
        "How Backstage <a href=\"https://backstage.io/docs/features/software-catalog/well-known-annotations\" target=\"_blank\" rel=\"noopener noreferrer\">annotations<span class=\"sr-only\"> (opens in new tab)</span></a> tie a catalog entity to its live deployment status",
        "How to trace a silent failure across tools from each one's logs and UI",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Fdead-reckoning_intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "",
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
  ],
};
