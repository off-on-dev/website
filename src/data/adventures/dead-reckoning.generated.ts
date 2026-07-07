import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const DEAD_RECKONING: Adventure = {
  id: "dead-reckoning",
  title: "Dead Reckoning",
  month: "JUL 2026",
  story: "The Grand Fleet's commission office is buried in complaints. Manifests are filed but nothing comes of them. Vessels that do sail arrive at port with the wrong cargo, and no one along the route can explain why. As the fleet's engineer, your mission is to restore order from keel to quayside and find out what the records are hiding.",
  metaDescription: "Dead Reckoning: a hands-on Backstage, Gitea, Argo Workflows adventure on OffOn.",
  tags: ["Backstage", "Gitea", "Argo Workflows", "Argo CD", "OpenTelemetry", "Jaeger"],
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
        "How Backstage <a href=\"https://backstage.io/docs/features/software-templates/writing-templates\" target=\"_blank\" rel=\"noopener noreferrer\">software templates<span class=\"sr-only\"> (opens in new tab)</span></a> are structured: parameters, steps, and output",
        "How scaffolder <a href=\"https://backstage.io/docs/features/software-templates/builtin-actions\" target=\"_blank\" rel=\"noopener noreferrer\">actions<span class=\"sr-only\"> (opens in new tab)</span></a> work, such as <code>fetch:template</code>, <code>publish:gitea</code>, and <code>catalog:register</code>",
        "How the <a href=\"https://backstage.io/docs/features/software-catalog/life-of-an-entity\" target=\"_blank\" rel=\"noopener noreferrer\">catalog registration<span class=\"sr-only\"> (opens in new tab)</span></a> step connects a scaffolded repository to the Backstage catalog",
        "How to use Backstage's built-in <a href=\"https://backstage.io/docs/features/software-templates/\" target=\"_blank\" rel=\"noopener noreferrer\">template tooling<span class=\"sr-only\"> (opens in new tab)</span></a>: the installed-actions browser and the Template Editor's live preview and dry-run",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Fdead-reckoning_beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "",
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
<pre tabindex="0" aria-label="Code block"><code>backstage/templates/vessel-commissioning/template.yaml
</code></pre>
<p>Read it from top to bottom. Its three sections, <strong>parameters</strong> (the form), <strong>steps</strong> (the
commissioning procedure), and <strong>output</strong> (what the captain sees at the end), each have a
📖 documentation link above them. Compare each section against the <a href="#objective">Objective</a>:
the form, the steps, and the output each have something to put right.</p>
<p>The fastest way to work is the <strong>Template Editor</strong> tab in <strong>Create</strong>: point it at the template
and it reloads your edits <strong>instantly</strong>, with a live preview of the form and a dry-run, so you
never have to restart Backstage between attempts. (Running the template from the main <strong>Create</strong>
list instead uses the copy in Backstage's catalog, which re-reads the file on its own after a
short delay.)</p>
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
  ],
};
