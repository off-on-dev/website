import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import lexImperfectaBeginner from "@/assets/diagrams/lex-imperfecta-beginner.svg";
import type { Adventure } from "./types";

export const LEX_IMPERFECTA: Adventure = {
  id: "lex-imperfecta",
  title: "Lex Imperfecta",
  icon: "Scale",
  month: "JUN 2026",
  story: "The Roman Republic has built a sophisticated legal system to protect its citizens — but the laws were written in haste, and the exceptions were written too generously. Policies go unenforced, the wrong citizens are exempt, and something has slipped through the gates unnoticed. As a newly appointed Praetor, your mission is to restore order before chaos takes hold.",
  tags: ["Kyverno", "Kubernetes"],
  backstory: [
    "The Roman Republic has built a sophisticated legal system to protect its citizens — but the laws were written in haste, and the exceptions were written too generously. Policies go unenforced, the wrong citizens are exempt, and something has slipped through the gates unnoticed. As a newly appointed Praetor, your mission is to restore order before chaos takes hold.",
  ],
  overview: [
    "The Republic's legal system is in disarray — workloads run unchecked, required labels go missing, and privileged containers slip through the gates. As a newly appointed Praetor, your mission is to restore order by fixing broken Kyverno policies and enforcing proper admission control.",
  ],
  rewards: {
    deadline: "Tuesday, 23 June 2026 at 23:59 CET",
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
      audience: `Platform engineers, SREs, and developers curious about Kubernetes security — no prior Kyverno experience needed, but familiarity with basic \`kubectl\` and YAML will help.`,
      learnings: [
        "How Kyverno [ValidatingPolicy](https://kyverno.io/docs/policy-types/validating-policy/) resources and  [CEL validation expressions](https://kubernetes.io/docs/reference/using-api/cel/) work",
        "The difference between [Audit, Deny, and Warn](https://kyverno.io/docs/policy-types/validating-policy/) validation actions",
        "How to use [custom label keys](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) to  enforce workload identity standards",
        "How Kyverno [MutatingPolicy](https://kyverno.io/docs/policy-types/mutating-policy/) resources automatically  patch incoming workloads at admission",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2Flex-imperfecta_beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "",
      intro: ["Fix broken Kyverno policies to restore proper admission control."],
      backstory: [
        "The Republic's legal scholars have been busy — perhaps too busy. In their haste to codify the Twelve Tables, the  foundation of the Republic's legal system, they introduced errors that now threaten the city's order. Workloads  that should be blocked are running freely, and workloads that should be allowed are being turned away at the gates.",
        "Another scholar left a note: \"I tried to set up policies for privileged containers and required labels, but  something's off — I can't figure out why the wrong things are getting through. There was also supposed to be a  system for automatically issuing travel permits to foreign visitors, but that one is broken too.\"",
        "Your mission: investigate the Kyverno policies and restore proper admission control before chaos reaches the city.",
      ],
      objective: [
        `All workloads **missing the \`republic.rome/gens\` label** are blocked at admission with a clear policy violation message`,
        "All workloads **running as privileged containers** are blocked at admission with a clear policy violation message",
        `All pods declaring **\`republic.rome/traveler: peregrinus\`** automatically receive the **\`republic.rome/travel-permit: granted\`** label`,
        "**All other workloads** deploy and run successfully in the cluster",
      ],
      architecture: [
        "The Twelve Tables enforced Roman law **at the gates** — before a citizen could act, not after the damage was done. Kyverno works the same way: it intercepts every workload request *before* it reaches the cluster. A misconfigured policy doesn't just fail to enforce — it fails silently, letting non-compliant workloads slip through while you assume everything is fine.",
        `Your Codespace comes with a Kubernetes cluster and Kyverno pre-installed. Three broken policies are already deployed in \`manifests/policies/\` — two \`ValidatingPolicy\` resources and one \`MutatingPolicy\`. Edit them directly and re-apply with \`kubectl\`. The pods in \`manifests/pods/\` are for reference only — no GitOps, no dashboards.`,
      ],
      architectureDiagram: lexImperfectaBeginner,
      diagramAlt: "Workload request flows through Kyverno's admission webhook before reaching the Kubernetes cluster. Two ValidatingPolicy resources block non-compliant workloads, and one MutatingPolicy automatically patches admitted workloads with required labels.",
      toolbox: [
        { name: "kubectl", description: "Apply and inspect cluster resources", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kyverno CLI", description: "Test and lint policies locally before applying", url: "https://kyverno.io/docs/kyverno-cli/" },
        { name: "k9s", description: "Explore cluster resources in a terminal UI", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Explore the Cluster", content: `When your Codespace is ready, four pods are already running — or trying to. Open a terminal and check what's going on:

\`\`\`bash
kubectl get pods
\`\`\`

Inspect why a pod was blocked or admitted:

\`\`\`bash
kubectl describe pod <pod-name>
\`\`\`

Check the policies that are in place:

\`\`\`bash
kubectl get validatingpolicies
kubectl get validatingpolicy require-labels -o yaml
kubectl get validatingpolicy no-privileged-containers -o yaml

kubectl get mutatingpolicies
kubectl get mutatingpolicy stamp-travel-permit -o yaml
\`\`\`

You can also launch **k9s** for a terminal UI view of all cluster resources:

\`\`\`bash
k9s
\`\`\`

Navigate to \`ValidatingPolicy\` resources with \`:validatingpolicies\` and \`MutatingPolicy\` resources with \`:mutatingpolicies\` to inspect all three policies.
` },
        { title: "Fix the Policies", content: `Review the [Objective](#objective) and investigate what's wrong in \`manifests/policies/\`.

All three broken policies are in \`manifests/policies/\`. Read them carefully — each has a different kind of misconfiguration.

**Test Locally with the Kyverno CLI**

Before applying to the cluster, you can use the \`kyverno\` CLI to test your policy changes locally against the workload manifests:

\`\`\`bash
kyverno apply manifests/policies/require-labels.yaml --resource manifests/pods/missing-labels.yaml
kyverno apply manifests/policies/no-privileged-containers.yaml --resource manifests/pods/privileged.yaml
kyverno apply manifests/policies/stamp-travel-permit.yaml --resource manifests/pods/peregrinus.yaml
\`\`\`

This gives you fast feedback without touching the cluster.

**Apply to the Cluster**

Once you're happy with your changes, re-apply everything:

\`\`\`bash
make apply
\`\`\`

This re-applies the policies and re-deploys all workloads so you immediately see the effect of your changes.
` },
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
    },
  ],
};
