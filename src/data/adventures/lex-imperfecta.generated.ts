import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import lexImperfectaBeginner from "@/assets/diagrams/lex-imperfecta-beginner.svg";
import type { Adventure } from "./types";

export const LEX_IMPERFECTA: Adventure = {
  id: "lex-imperfecta",
  title: "Lex Imperfecta",
  icon: "Scale",
  month: "JUN 2026",
  story: "The Roman Republic has built a sophisticated legal system to protect its citizens — but the laws were written in haste, and the exceptions were written too generously. Policies go unenforced, the wrong citizens are exempt, and something has slipped through the gates unnoticed. As a newly appointed Praetor, your mission is to restore order before chaos takes hold.",
  metaDescription: "The Republic's legal system is in disarray — workloads run unchecked, required labels go missing, and privileged containers slip through the gates. As a...",
  tags: ["Kyverno", "Kubernetes"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    aboutHtml: "DevRel at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
  },
  backstory: [
    "The Roman Republic has built a sophisticated legal system to protect its citizens — but the laws were written in haste, and the exceptions were written too generously. Policies go unenforced, the wrong citizens are exempt, and something has slipped through the gates unnoticed. As a newly appointed Praetor, your mission is to restore order before chaos takes hold.",
  ],
  overview: [
    "The Republic's legal system is in disarray — workloads run unchecked, required labels go missing, and privileged containers slip through the gates. As a newly appointed Praetor, your mission is to restore order by fixing broken Kyverno policies and enforcing proper admission control.",
  ],
  rewards: {
    deadline: "2026-06-23T23:59:00+01:00",
    eligibility: "Complete all levels and post your solution in the community before the deadline to be eligible.",
    tiers: [
      { label: "1st place", description: "50% voucher for a Linux Foundation certification" },
      { label: "Top 3", description: "Credly badge to showcase the achievement" },
    ],
    rankingNote: "Ranking is determined by total points across all three levels. Points per level are awarded by submission order within the active week (100 for the first valid solution, 95 for the second, and so on; late submissions still earn 60).",
    rankingRulesUrl: `${COMMUNITY_URL}/t/about-the-challenges-category/16`,
  },
  upcomingLevels: [
    { name: "Intermediate", difficulty: "Intermediate" },
    { name: "Expert", difficulty: "Expert" },
  ],
  levels: [
    {
      id: "beginner",
      name: "The Twelve Tables",
      difficulty: "Beginner",
      topics: ["Kyverno", "Kubernetes"],
      audience: "Platform engineers, SREs, and developers curious about Kubernetes security — no prior Kyverno experience needed, but familiarity with basic <code>kubectl</code> and YAML will help.",
      learnings: [
        "How Kyverno <a href=\"https://kyverno.io/docs/policy-types/validating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">ValidatingPolicy<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\" style=\"flex-shrink:0\"><path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/></svg><span class=\"sr-only\"> (opens in new tab)</span></a> resources and  <a href=\"https://kubernetes.io/docs/reference/using-api/cel/\" target=\"_blank\" rel=\"noopener noreferrer\">CEL validation expressions<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\" style=\"flex-shrink:0\"><path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/></svg><span class=\"sr-only\"> (opens in new tab)</span></a> work",
        "The difference between <a href=\"https://kyverno.io/docs/policy-types/validating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">Audit, Deny, and Warn<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\" style=\"flex-shrink:0\"><path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/></svg><span class=\"sr-only\"> (opens in new tab)</span></a> validation actions",
        "How to use <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/\" target=\"_blank\" rel=\"noopener noreferrer\">custom label keys<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\" style=\"flex-shrink:0\"><path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/></svg><span class=\"sr-only\"> (opens in new tab)</span></a> to  enforce workload identity standards",
        "How Kyverno <a href=\"https://kyverno.io/docs/policy-types/mutating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">MutatingPolicy<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\" style=\"flex-shrink:0\"><path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/></svg><span class=\"sr-only\"> (opens in new tab)</span></a> resources automatically  patch incoming workloads at admission",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Flex-imperfecta_beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "https://community.offon.dev/t/restore-proper-admission-control-using-kyverno-june-2026-adventure-beginner/1576",
      deadline: "2026-06-23T23:59:00+01:00",
      intro: ["Fix broken Kyverno policies to restore proper admission control."],
      backstory: [
        "The Republic's legal scholars have been busy — perhaps too busy. In their haste to codify the Twelve Tables, the  foundation of the Republic's legal system, they introduced errors that now threaten the city's order. Workloads  that should be blocked are running freely, and workloads that should be allowed are being turned away at the gates.",
        "Another scholar left a note: \"I tried to set up policies for privileged containers and required labels, but  something's off — I can't figure out why the wrong things are getting through. There was also supposed to be a  system for automatically issuing travel permits to foreign visitors, but that one is broken too.\"",
        "Your mission: investigate the Kyverno policies and restore proper admission control before chaos reaches the city.",
      ],
      objective: [
        "All workloads <strong>missing the <code>republic.rome/gens</code> label</strong> are blocked at admission with a clear policy violation message",
        "All workloads <strong>running as privileged containers</strong> are blocked at admission with a clear policy violation message",
        "All pods declaring <strong><code>republic.rome/traveler: peregrinus</code></strong> automatically receive the <strong><code>republic.rome/travel-permit: granted</code></strong> label",
        "<strong>All other workloads</strong> deploy and run successfully in the cluster",
      ],
      architecture: [
        "<p>The Twelve Tables enforced Roman law <strong>at the gates</strong> — before a citizen could act, not after the damage was done. Kyverno works the same way: it intercepts every workload request <em>before</em> it reaches the cluster. A misconfigured policy doesn't just fail to enforce — it fails silently, letting non-compliant workloads slip through while you assume everything is fine.</p>",
        "<p>Your Codespace comes with a Kubernetes cluster and Kyverno pre-installed. Three broken policies are already deployed in <code>manifests/policies/</code> — two <code>ValidatingPolicy</code> resources and one <code>MutatingPolicy</code>. Edit them directly and re-apply with <code>kubectl</code>. The pods in <code>manifests/pods/</code> are for reference only — no GitOps, no dashboards.</p>",
      ],
      architectureDiagram: lexImperfectaBeginner,
      diagramAlt: "Workload request flows through Kyverno's admission webhook before reaching the Kubernetes cluster. Two ValidatingPolicy resources block non-compliant workloads, and one MutatingPolicy automatically patches admitted workloads with required labels.",
      toolbox: [
        { name: "kubectl", description: "Apply and inspect cluster resources", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kyverno CLI", description: "Test and lint policies locally before applying", url: "https://kyverno.io/docs/kyverno-cli/" },
        { name: "k9s", description: "Explore cluster resources in a terminal UI", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Explore the Cluster", content: `<p>When your Codespace is ready, four pods are already running — or trying to. Open a terminal and check what's going on:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">kubectl get pods
</code></pre>
<p>Inspect why a pod was blocked or admitted:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">kubectl describe pod &#x3C;pod-name>
</code></pre>
<p>Check the policies that are in place:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">kubectl get validatingpolicies
kubectl get validatingpolicy require-labels -o yaml
kubectl get validatingpolicy no-privileged-containers -o yaml

kubectl get mutatingpolicies
kubectl get mutatingpolicy stamp-travel-permit -o yaml
</code></pre>
<p>You can also launch <strong>k9s</strong> for a terminal UI view of all cluster resources:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">k9s
</code></pre>
<p>Navigate to <code>ValidatingPolicy</code> resources with <code>:validatingpolicies</code> and <code>MutatingPolicy</code> resources with <code>:mutatingpolicies</code> to inspect all three policies.</p>` },
        { title: "Fix the Policies", content: `<p>Review the <a href="#objective">Objective</a> and investigate what's wrong in <code>manifests/policies/</code>.</p>
<p>All three broken policies are in <code>manifests/policies/</code>. Read them carefully — each has a different kind of misconfiguration.</p>
<p><strong>Test Locally with the Kyverno CLI</strong></p>
<p>Before applying to the cluster, you can use the <code>kyverno</code> CLI to test your policy changes locally against the workload manifests:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">kyverno apply manifests/policies/require-labels.yaml --resource manifests/pods/missing-labels.yaml
kyverno apply manifests/policies/no-privileged-containers.yaml --resource manifests/pods/privileged.yaml
kyverno apply manifests/policies/stamp-travel-permit.yaml --resource manifests/pods/peregrinus.yaml
</code></pre>
<p>This gives you fast feedback without touching the cluster.</p>
<p><strong>Apply to the Cluster</strong></p>
<p>Once you're happy with your changes, re-apply everything:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">make apply
</code></pre>
<p>This re-applies the policies and re-deploys all workloads so you immediately see the effect of your changes.</p>` },
      ],
      helpfulLinks: [
        { title: "Kyverno ValidatingPolicy", url: "https://kyverno.io/docs/policy-types/validating-policy/", description: "Reference docs for ValidatingPolicy — the resource type you'll fix to block non-compliant workloads" },
        { title: "Kyverno MutatingPolicy", url: "https://kyverno.io/docs/policy-types/mutating-policy/", description: "Reference docs for MutatingPolicy — the resource type you'll fix to auto-stamp travel permits" },
        { title: "CEL Validation Expressions", url: "https://kubernetes.io/docs/reference/using-api/cel/", description: "How CEL expressions work in Kubernetes admission — what you'll write inside the policy rules" },
        { title: "Kyverno Playground", url: "https://playground.kyverno.io", description: "Test your CEL expressions interactively against sample resources before applying them to the cluster" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "The Twelve Tables: Fix broken Kyverno policies to restore proper admission control. A beginner Kyverno, Kubernetes challenge on OffOn.",
    },
  ],
};
