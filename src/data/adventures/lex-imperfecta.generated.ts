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
  tags: ["Kyverno", "Policy Reporter", "Kubernetes"],
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
    deadline: "2026-06-30T23:59:00+01:00",
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
      name: "The Twelve Tables",
      difficulty: "Beginner",
      topics: ["Kyverno", "Kubernetes"],
      audience: "Platform engineers, <abbr title=\"Site Reliability Engineers\">SREs</abbr>, and developers curious about Kubernetes security — no prior Kyverno experience needed, but familiarity with basic <code>kubectl</code> and YAML will help.",
      learnings: [
        "How Kyverno <a href=\"https://kyverno.io/docs/policy-types/validating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">ValidatingPolicy<span class=\"sr-only\"> (opens in new tab)</span></a> resources and  <a href=\"https://kubernetes.io/docs/reference/using-api/cel/\" target=\"_blank\" rel=\"noopener noreferrer\">CEL validation expressions<span class=\"sr-only\"> (opens in new tab)</span></a> work",
        "The difference between <a href=\"https://kyverno.io/docs/policy-types/validating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">Audit, Deny, and Warn<span class=\"sr-only\"> (opens in new tab)</span></a> validation actions",
        "How to use <a href=\"https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/\" target=\"_blank\" rel=\"noopener noreferrer\">custom label keys<span class=\"sr-only\"> (opens in new tab)</span></a> to  enforce workload identity standards",
        "How Kyverno <a href=\"https://kyverno.io/docs/policy-types/mutating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">MutatingPolicy<span class=\"sr-only\"> (opens in new tab)</span></a> resources automatically  patch incoming workloads at admission",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F05-lex-imperfecta_01-beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "https://community.offon.dev/t/restore-proper-admission-control-using-kyverno-june-2026-adventure-beginner/1576",
      deadline: "2026-06-30T23:59:00+01:00",
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
    {
      id: "intermediate",
      name: "Governing the Provinces",
      difficulty: "Intermediate",
      topics: ["Kyverno", "Policy Reporter", "Kubernetes"],
      audience: "Platform engineers and <abbr title=\"Site Reliability Engineers\">SREs</abbr> who have some familiarity with Kyverno, ideally after completing the Beginner level. You should be comfortable reading Kubernetes YAML and basic kubectl commands.",
      learnings: [
        "How to scope policies using <a href=\"https://kyverno.io/docs/policy-types/validating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">ValidatingPolicy<span class=\"sr-only\"> (opens in new tab)</span></a> (cluster-wide) and <a href=\"https://kyverno.io/docs/policy-types/validating-policy/#policy-scope\" target=\"_blank\" rel=\"noopener noreferrer\">NamespacedValidatingPolicy<span class=\"sr-only\"> (opens in new tab)</span></a> (per-namespace), and when to use each",
        "How <a href=\"https://kubernetes.io/docs/reference/using-api/cel/\" target=\"_blank\" rel=\"noopener noreferrer\">CEL expressions<span class=\"sr-only\"> (opens in new tab)</span></a> in <code>ValidatingPolicy</code> and <code>PolicyException</code> express fine-grained admission conditions",
        "How to write and scope a <a href=\"https://kyverno.io/docs/guides/exceptions/\" target=\"_blank\" rel=\"noopener noreferrer\">PolicyException<span class=\"sr-only\"> (opens in new tab)</span></a> correctly so only the intended workloads are exempt",
        "How to use <a href=\"https://kyverno.github.io/policy-reporter/\" target=\"_blank\" rel=\"noopener noreferrer\">Policy Reporter<span class=\"sr-only\"> (opens in new tab)</span></a> and the <a href=\"https://openreports.io/\" target=\"_blank\" rel=\"noopener noreferrer\">OpenReports<span class=\"sr-only\"> (opens in new tab)</span></a> format to audit and debug a policy estate across multiple namespaces",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F05-lex-imperfecta_02-intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "https://community.offon.dev/t/fix-a-broken-kyverno-policy-estate-june-2026-adventure-intermediate/1581",
      deadline: "2026-06-30T23:59:00+01:00",
      intro: [
        "Fix a misconfigured Kyverno policy estate and use Policy Reporter to restore proper governance across the Republic's provinces.",
      ],
      backstory: [
        "The Republic has grown. What once was a single city is now a sprawling empire of provinces, each governed by different magistrates with different needs. The legal scholars decided to catalogue every law in a central archive (the Tabularium) so that each province's statutes could be tracked and audited in one place.",
        "But cataloguing the laws introduced new chaos. Policies meant for one province are bleeding into another. Exceptions that were meant to be narrow have been written too broadly. And somewhere in the estate, a workload is slipping through that shouldn't be.",
        "The Tabularium's auditors have handed you a report: Policy Reporter shows violations where there should be none, and silence where there should be enforcement. Your mission: investigate the policy estate, fix the scoping issues, and restore order before the provinces descend into chaos.",
      ],
      objective: [
        "<strong>Empire-wide laws</strong> enforce across every province: no privileged containers, every workload carries a valid <code>republic.rome/gens</code> and <code>republic.rome/province</code> matching its namespace, scoped by namespace label rather than hardcoded names",
        "<strong>Aegyptus's scribe law</strong> applies only within Aegyptus, admitting <code>republic.rome/role: scribe</code> workloads exclusively",
        "The <strong>legacy exception</strong> is scoped to Aegyptus's grandfathered workload and cannot be claimed by any other province",
        "The <strong>Tabularium's ledger</strong> is on file: policy reports exported in OpenReports format as <code>estate-audit.yaml</code>",
      ],
      architecture: [
        "<p>Five namespaces span the estate: four <strong>provinces</strong> (<code>gallia</code>, <code>hispania</code>, <code>britannia</code>, <code>aegyptus</code>) with <code>republic.rome/realm: province</code>, and <code>castra</code>, the <strong>infra</strong> namespace, with <code>republic.rome/realm: infra</code>. These labels drive policy scoping; use <code>kubectl get ns --show-labels</code> to inspect them.</p>",
        "<p>Two <strong>empire-wide</strong> policies cover all provinces: <code>no-privileged-containers</code> and <code>require-census</code> (every workload must declare a valid <code>republic.rome/gens</code> and a matching <code>republic.rome/province</code>). Aegyptus adds <code>aegyptus-require-scribe-role</code> for its local scribe requirement, and a <strong><code>PolicyException</code></strong> covers its single legacy workload.</p>",
        "<p>The broken policies live in <code>manifests/policies/</code> and <code>manifests/exceptions/</code>. After each change, run <code>make apply</code> to redeploy the workloads, then <code>make verify</code> to check your progress.</p>",
      ],
      toolbox: [
        { name: "kubectl", description: "Apply and inspect cluster resources, check namespace labels and policy status", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "kyverno CLI", description: "Test and lint policies locally before applying to the cluster", url: "https://kyverno.io/docs/kyverno-cli/" },
        { name: "k9s", description: "Explore cluster resources and policy reports in a terminal UI", url: "https://k9scli.io/" },
      ],
      howToPlay: [
        { title: "Explore the Estate", content: `<p>When your Codespace is ready, the policy estate is already deployed, but something is wrong.
Open Policy Reporter at port <strong>30110</strong> (find it in the <strong>Ports</strong> tab) to get an overview of the estate:</p>
<ul>
<li>Which namespaces have violations?</li>
<li>Which policies are generating results, and which are silent when they shouldn't be?</li>
</ul>
<p>Then dig into the cluster:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash"># Inspect the namespace topology — the labels here drive policy scoping
kubectl get ns --show-labels

# List all policies — note which are cluster-wide and which are namespaced
kubectl get validatingpolicies
kubectl get namespacedvalidatingpolicies -A

# Inspect any policy or exception in full
kubectl get validatingpolicy &#x3C;name> -o yaml
kubectl get policyexceptions -A -o yaml

# See the raw OpenReports data behind Policy Reporter
kubectl get policyreports -A
</code></pre>
<p>You can also launch <strong>k9s</strong> for a terminal UI view:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">k9s
</code></pre>` },
        { title: "Fix the Policies", content: `<p>Review the <a href="#objective">Objective</a> and investigate what is wrong in <code>manifests/policies/</code> and
<code>manifests/exceptions/</code>.</p>
<p>Think about what each policy is <em>supposed</em> to cover, and compare that against what it is <em>actually</em>
matching. The namespace labels you saw with <code>kubectl get ns --show-labels</code> are a key part of the picture.</p>
<p><strong>Test locally with the Kyverno CLI before applying:</strong></p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">kyverno apply manifests/policies/require-census.yaml --resource manifests/workloads/citizens.yaml
kyverno apply manifests/policies/aegyptus-require-scribe-role.yaml --resource manifests/workloads/aegyptus-legacy-scribe.yaml
</code></pre>
<p><strong>Apply your changes to the cluster:</strong></p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">make apply
</code></pre>
<p>Policies only act at admission, so <code>make apply</code> redeploys the workloads to re-evaluate the estate against
your changes. Then check Policy Reporter again. The picture should improve as you fix each issue.</p>` },
        { title: "File the Audit", content: `<p>Once the estate is in order, the Senate expects the Tabularium's ledger on file. Export the cluster's
policy reports, the OpenReports data behind Policy Reporter, as the audit of record.</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash">kubectl get policyreports -A -o yaml > estate-audit.yaml
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "Kyverno ValidatingPolicy", url: "https://kyverno.io/docs/policy-types/validating-policy/", description: "Reference docs for ValidatingPolicy and NamespacedValidatingPolicy: the policy types you'll fix" },
        { title: "Kyverno PolicyException", url: "https://kyverno.io/docs/guides/exceptions/", description: "How to write and scope a PolicyException to exempt specific workloads" },
        { title: "CEL Validation Expressions", url: "https://kubernetes.io/docs/reference/using-api/cel/", description: "How CEL expressions work in Kubernetes admission, including accessing namespace context" },
        { title: "Policy Reporter", url: "https://kyverno.github.io/policy-reporter/", description: "How to use Policy Reporter to audit and visualise policy results across the cluster" },
        { title: "OpenReports Format", url: "https://openreports.io/", description: "The OpenReports standard that Kyverno uses to emit PolicyReport resources" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "Governing the Provinces: Fix a misconfigured Kyverno policy estate and use Policy Reporter to restore proper governance across the Republic's provinces.",
    },
    {
      id: "expert",
      name: "Quis Custodiet",
      difficulty: "Expert",
      topics: ["Kyverno", "Policy Reporter", "Kubernetes"],
      audience: "Security engineers and platform engineers who want to explore the boundary between admission control and runtime security. Completing the Intermediate level first is helpful but not required. You should be comfortable reading Kyverno ValidatingPolicies and CEL expressions. No prior Falco experience required.",
      learnings: [
        "How <a href=\"https://falco.org/docs/reference/rules/\" target=\"_blank\" rel=\"noopener noreferrer\">Falco rules<span class=\"sr-only\"> (opens in new tab)</span></a> are structured: conditions, output, and kernel-level fields, and how to write a rule targeting a specific runtime behaviour",
        "Why <code>privileged: false</code> is not enough: how <a href=\"https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-capabilities-for-a-container\" target=\"_blank\" rel=\"noopener noreferrer\">Linux capabilities<span class=\"sr-only\"> (opens in new tab)</span></a> grant host-level access without the privileged flag",
        "How to use <a href=\"https://kyverno.io/docs/policy-types/validating-policy/\" target=\"_blank\" rel=\"noopener noreferrer\">spec.variables<span class=\"sr-only\"> (opens in new tab)</span></a> in a <code>ValidatingPolicy</code> to share reusable CEL expressions across validations",
        "How pod volumes reference secrets, and why a volume's name and the secret it mounts are two separate fields in the pod spec",
        "How <a href=\"https://github.com/falcosecurity/falcosidekick\" target=\"_blank\" rel=\"noopener noreferrer\">Falcosidekick<span class=\"sr-only\"> (opens in new tab)</span></a> aggregates Falco alerts and how to use its UI to watch a runtime incident in real time",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F05-lex-imperfecta_03-expert%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: "https://community.offon.dev/t/catch-the-intruder-the-guard-couldnt-see-june-2026-adventure-expert/1591",
      deadline: "2026-06-30T23:59:00+01:00",
      intro: [
        "An intruder is already inside the Republic, and the watchmen cannot see it. Fix the Praetorian Guard's broken detection rule, close the admission gap that let the intruder slip through, and seal the census archive against unauthorized access.",
      ],
      backstory: [
        "The Republic's defences have always rested on the law: block the wrong workloads at the gate, and nothing bad gets in. But the Senate's Praetorian Guard was built for a different threat: the workload that slips through and acts badly at runtime. The Guard watches the provinces through Falco, but tonight, the watchtower is dark. Someone broke the rule that should fire when the census archive is touched. The Guard sees nothing.",
        "And while the Guard slept, an intruder crept in. It declared valid labels, passed the census, and presented itself as a loyal citizen of the Republic. Its papers were in order. Its power was not. Once inside, it reached straight for the census archive: the imperial rolls of every citizen, sealed records it had no right to touch. It reads them on a loop and tries to send them out of the Republic.",
      ],
      objective: [
        "<strong>The Praetorian Guard awake</strong>: Falco fires an alert every time an unauthorized process reads the census archive, with live alerts streaming into the Falcosidekick UI",
        "<strong>The gate closed</strong>: the intruder is denied re-admission. The policy that kept privileged containers out now covers every path to unchecked host power",
        "<strong>The archive sealed</strong>: the census-archive secret is inaccessible to any workload that does not bear the Archivist role",
        "<strong>The empire-wide laws holding</strong>: all intermediate-level checks still green across every province",
      ],
      architecture: [
        "<p>The estate inherits the full intermediate topology: four province namespaces (<code>gallia</code>, <code>hispania</code>, <code>britannia</code>, <code>aegyptus</code>) and one infra namespace (<code>castra</code>), each labelled as before. Alongside the Kyverno stack and Policy Reporter, the cluster now runs <strong>Falco</strong> (<abbr title=\"extended Berkeley Packet Filter\">eBPF</abbr>-based, as a DaemonSet) and <strong>Falcosidekick</strong> with its UI at port <strong>30111</strong>. At startup, an intruder pod is already running in one of the provinces, quietly reading the census archive: imperial rolls that only workloads bearing the <code>republic.rome/role: archivist</code> label are permitted to access.</p>",
        "<p>Your working directory is the challenge root. <code>manifests/secrets/</code> and <code>manifests/workloads/</code> are already in place. They define the estate and the intruder, and need no changes. Everything else is yours to investigate and fix.</p>",
      ],
      toolbox: [
        { name: "kubectl", description: "Apply and inspect cluster resources, check pod status and security contexts", url: "https://kubernetes.io/docs/reference/kubectl/" },
        { name: "k9s", description: "Explore cluster resources, pod logs, and policy reports in a terminal UI", url: "https://k9scli.io/" },
        { name: "kyverno", description: "Test a policy against a resource locally before applying it to the cluster", url: "https://kyverno.io/docs/kyverno-cli/" },
      ],
      howToPlay: [
        { title: "Survey the Scene", content: `<p>When your Codespace opens, the intruder is already running. Open the <strong>Falcosidekick UI</strong> at
the forwarded port <strong>30111</strong>. It should be streaming alerts about census archive reads,
but it is silent. That silence is your first clue that something is wrong with the Guard.</p>
<p>Start by getting oriented:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-bash"># Can you find the intruder?
kubectl get pods -A

# Read the Falco rule that should be firing
cat falco-rules.yaml

# Which policies are in force?
kubectl get validatingpolicies
kubectl get namespacedvalidatingpolicies -A
</code></pre>
<p>Open <strong>Policy Reporter</strong> at port <strong>30110</strong> as well. The intermediate estate should look clean:
the intruder left no trace at admission. That is part of the problem.</p>` },
        { title: "Act 1: Wake the Praetorian Guard", content: `<p>The Falco rule in <code>falco-rules.yaml</code> has a defect: find the break, fix it, and run <code>make apply</code>;
alerts streaming into the <strong>Falcosidekick UI at port 30111</strong> are your signal. The
<a href="https://falco.org/docs/reference/rules/supported-fields/" target="_blank" rel="noopener noreferrer">Falco condition fields reference<span class="sr-only"> (opens in new tab)</span></a>
documents every available field.</p>` },
        { title: "Act 2: Close the Gate", content: `<p>The intruder passed admission: find the policy gap that let it through, close it, and run
<code>make apply</code>; re-admission denied and the <strong>Falcosidekick UI</strong> going quiet confirm Act 2 is done.
The existing policy already uses <a href="https://kyverno.io/docs/policy-types/validating-policy/" target="_blank" rel="noopener noreferrer">spec.variables<span class="sr-only"> (opens in new tab)</span></a>
to share expressions across validations, a pattern worth exploring.</p>` },
        { title: "Act 3: Seal the Archive", content: `<p>Open <code>manifests/policies/</code>: something is missing; the other policies show the structure, write
what's needed, then run <code>make apply</code>.</p>
<p><strong>Going further:</strong> even with the archive sealed at admission, any workload admitted with the
Archivist role can read the secret. Kubernetes <abbr title="Role-Based Access Control">RBAC</abbr> can restrict which service accounts may
<code>get</code> a secret at the <abbr title="Application Programming Interface">API</abbr> level, a complementary layer that admission control alone cannot
provide.</p>` },
      ],
      helpfulLinks: [
        { title: "Falco Rules Reference", url: "https://falco.org/docs/reference/rules/", description: "The anatomy of a Falco rule: condition, output, priority, tags, and how rules are evaluated" },
        { title: "Falco Condition Fields", url: "https://falco.org/docs/reference/rules/supported-fields/", description: "Every field available in Falco rule conditions: syscall events, file descriptors, process info, and Kubernetes metadata" },
        { title: "Linux Capabilities in Kubernetes", url: "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-capabilities-for-a-container", description: "How Linux capabilities work and how to configure or restrict them in a pod's security context" },
        { title: "Kyverno ValidatingPolicy", url: "https://kyverno.io/docs/policy-types/validating-policy/", description: "Reference docs for ValidatingPolicy, including spec.variables for composing reusable CEL expressions" },
        { title: "CEL Validation Expressions", url: "https://kubernetes.io/docs/reference/using-api/cel/", description: "How CEL expressions work in Kubernetes admission: operators, optional chaining, and collection functions" },
        { title: "Falcosidekick", url: "https://github.com/falcosecurity/falcosidekick", description: "The Falco alert aggregator that routes Falco events to sinks including the Falcosidekick UI" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "Quis Custodiet: An intruder is already inside the Republic, and the watchmen cannot see it. Fix the Praetorian Guard's broken detection rule, close the...",
    },
  ],
};
