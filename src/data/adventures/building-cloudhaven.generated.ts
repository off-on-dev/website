import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const BUILDING_CLOUDHAVEN: Adventure = {
  id: "building-cloudhaven",
  title: "Building CloudHaven",
  icon: "Building2",
  month: "JAN 2026",
  story: "Join the Infrastructure Guild and modernize CloudHaven's infrastructure from manual provisioning to a self-service platform using Infrastructure as Code. A hands-on journey through infrastructure as code with OpenTofu and GitHub Actions.",
  metaDescription: "Building CloudHaven: a hands-on OpenTofu, Terraform, GitHub Actions adventure on OffOn.",
  tags: ["OpenTofu", "Terraform", "GitHub Actions", "Trivy", "TDD"],
  contributor: {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    aboutHtml: "<abbr data-title=\"Developer Relations\" tabindex=\"0\" aria-describedby=\"abbr-exp-45\">DevRel</abbr><span id=\"abbr-exp-45\" class=\"sr-only\">Developer Relations</span> at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
  },
  backstory: [
    "Welcome to CloudHaven, a bustling digital metropolis where every district depends on essential services to thrive. You've just joined the Infrastructure Guild, a team of platform engineers responsible for providing the tools and services that keep the city running.",
    "CloudHaven is expanding rapidly. The Merchant's Quarter needs storage vaults for their goods and ledgers for tracking inventory. The Scholar's District requires secure archives for ancient texts. The Artisan's Quarter demands workshops with specialized tools. Each district has unique needs, but they all depend on the Guild to provide reliable, scalable infrastructure services.",
    "The Guild used to provision everything manually through cloud consoles, a process that was slow, error-prone, and impossible to track. Recently, they've started adopting Infrastructure as Code, but the transition is incomplete.",
    "The Guild Master has assigned you to complete the modernization journey.",
    "Your mission: build the services and tools that will support CloudHaven's future growth.",
  ],
  levels: [
    {
      id: "beginner",
      name: "The Foundation Stones",
      difficulty: "Beginner",
      topics: ["OpenTofu"],
      learnings: [
        "Infrastructure as Code with OpenTofu",
        "Remote state management with <abbr data-title=\"Google Cloud Storage\" tabindex=\"0\" aria-describedby=\"abbr-exp-46\">GCS</abbr><span id=\"abbr-exp-46\" class=\"sr-only\">Google Cloud Storage</span> backend",
        "Dynamic resource provisioning with for_each",
        "Conditional resources with the enabled meta-argument, new in OpenTofu",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_01-beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/practice-infrastructure-as-code-with-zero-setup-adventure-02-beginner/656`,
      deadline: "2026-02-04T23:59:00+01:00",
      intro: [
        "An incomplete OpenTofu configuration is blocking the Merchant's Quarter from going live. Fix the broken backend, wire up dynamic resource provisioning with for_each, and use the new enabled meta-argument to conditionally deploy the audit database.",
      ],
      backstory: [
        "The Merchant's Quarter needs essential services, but the previous Guild engineer left the OpenTofu configuration incomplete and misconfigured. The state is stored locally, making collaboration impossible, and some services remain half-configured or missing.",
        "Your mission: fix the issues, complete the setup, and establish proper infrastructure management for the Guild.",
      ],
      objective: [
        "Provision storage vaults and ledger databases for each district dynamically",
        "Deploy the audit database only when there is more than one district",
        "Store state remotely in a GCS backend following best practices so the Guild can collaborate",
        "Resolve all TODOs in the code and successfully run tofu apply",
      ],
      toolbox: [
        { name: "tofu", description: "OpenTofu <abbr data-title=\"Command Line Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-47\">CLI</abbr><span id=\"abbr-exp-47\" class=\"sr-only\">Command Line Interface</span> for infrastructure provisioning", url: "https://opentofu.org/" },
        { name: "gcp-api-mock", description: "mock GCP API running locally to simulate cloud resources without real cloud costs (Cloud Storage and Cloud SQL only)", url: "https://github.com/KatharinaSick/gcp-api-mock" },
      ],
      howToPlay: [
        { title: "Wait for the Environment", content: "<p>Wait ~2 minutes for the environment to initialize.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 30104:</strong> GCP API Mock. Explore the mock cloud resources created by your configuration (Cloud Storage and Cloud SQL).</li>
</ul>` },
        { title: "Find the TODOs", content: `<p>All OpenTofu files are in <code>adventures/02-building-cloudhaven/beginner/</code>. Run:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">grep -r "TODO" .
</code></pre>
<p>Files to review: <code>main.tf</code>, <code>state.tf</code>, <code>variables.tf</code>, <code>merchants.tf</code>, <code>audit.tf</code>, <code>outputs.tf</code>.</p>` },
        { title: "Apply the Configuration", content: `<p>After fixing the TODOs, run:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">tofu apply
</code></pre>
<p>If you changed the backend configuration, run <code>tofu init -migrate-state</code> first.</p>` },
        { title: "Run the Smoke Test", content: `<p>Run the smoke test to verify your solution:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">./smoke-test.sh
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "OpenTofu documentation", url: "https://opentofu.org/docs/" },
        { title: "OpenTofu meta-arguments", url: "https://opentofu.org/docs/language/meta-arguments/count/" },
        { title: "OpenTofu backend configuration", url: "https://opentofu.org/docs/language/settings/backends/configuration/" },
        { title: "Google Cloud provider", url: "https://registry.terraform.io/providers/hashicorp/google/latest/docs" },
      ],
      verification: {
        command: "./smoke-test.sh",
        description: "Once you think you've solved the challenge, run the smoke test to verify your solution.",
      },
      metaDescription: "The Foundation Stones: An incomplete OpenTofu configuration is blocking the Merchant's Quarter from going live. Fix the broken backend, wire up dynamic...",
    },
    {
      id: "intermediate",
      name: "The Modular Metropolis",
      difficulty: "Intermediate",
      topics: ["OpenTofu", "TDD"],
      learnings: [
        "OpenTofu module testing with tofu test",
        "Test-Driven Development (TDD) workflow",
        "Input validation with custom rules",
        "Refactoring infrastructure safely with moved blocks",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_02-intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-02-building-cloudhaven-intermediate-the-modular-metropolis/723/10`,
      deadline: "2026-02-04T23:59:00+01:00",
      intro: [
        "A senior engineer wrote the tests first and then left. The module code is buggy and the integration test is incomplete. Fix the implementation to match the test expectations, complete the end-to-end test, and use moved blocks to refactor without destroying state.",
      ],
      backstory: [
        "After fixing the Foundation Stones, CloudHaven is thriving. The city has grown to three districts, and the Guild decided to refactor the infrastructure into reusable modules.",
        "A senior engineer started the work using Test-Driven Development, writing tests first then implementing. But they were called away before finishing, leaving behind working tests and buggy code that doesn't match them.",
        "Your mission: fix the bugs, complete the integration test, and deploy the infrastructure.",
      ],
      objective: [
        "All tests of the districts module pass",
        "A completed integration test that applies infrastructure against the mock GCP API to verify end-to-end functionality",
        "Three districts deployed with correctly configured infrastructure (vaults and ledgers)",
      ],
      toolbox: [
        { name: "tofu", description: "OpenTofu <abbr data-title=\"Command Line Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-48\">CLI</abbr><span id=\"abbr-exp-48\" class=\"sr-only\">Command Line Interface</span> for infrastructure provisioning", url: "https://opentofu.org/" },
        { name: "gcp-api-mock", description: "mock GCP API running locally to simulate cloud resources without real cloud costs (Cloud Storage and Cloud SQL only)", url: "https://github.com/KatharinaSick/gcp-api-mock" },
      ],
      howToPlay: [
        { title: "Wait for the Environment", content: "<p>Wait ~2 minutes for the environment to initialize.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 30104:</strong> GCP API Mock. Explore mock cloud resources to verify your module configuration.</li>
</ul>` },
        { title: "Fix the Failing Tests", content: `<p>All files are in <code>adventures/02-building-cloudhaven/intermediate/</code>. The tests define the expected behaviour: your job is to fix the implementation to match what the tests expect. Don't modify existing tests unless a comment tells you to.</p>
<pre tabindex="0" aria-label="Code block"><code>adventures/02-building-cloudhaven/intermediate/
├── main.tf                    # Provider and backend configuration
├── variables.tf               # Input variables
├── districts.tf               # Module calls for each district
├── outputs.tf                 # Infrastructure outputs
├── moved.tf                   # Resource migration blocks
├── modules/district/          # The district module (fix bugs here)
│   ├── main.tf                # Locals and tier configuration
│   ├── variables.tf           # Input validation
│   ├── vault.tf               # Storage bucket resource
│   ├── ledger.tf              # Cloud SQL resource
│   ├── outputs.tf             # Module outputs
│   └── tests/                 # Module tests (read these!)
└── tests/
    └── integration.tftest.hcl # Complete this test
</code></pre>
<p>Run tests to see what fails:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">make test
</code></pre>` },
        { title: "Apply the Infrastructure", content: `<p>Once all tests pass, apply the infrastructure:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">make test
make apply
</code></pre>` },
        { title: "Run the Smoke Test", content: `<p>Run the smoke test to verify your solution:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">./smoke-test.sh
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "OpenTofu testing", url: "https://opentofu.org/docs/cli/commands/test/" },
        { title: "OpenTofu modules", url: "https://opentofu.org/docs/language/modules/" },
        { title: "Input validation rules", url: "https://opentofu.org/docs/language/values/variables/#custom-validation-rules" },
        { title: "Moved blocks", url: "https://opentofu.org/docs/language/modules/develop/refactoring/" },
      ],
      verification: {
        command: "./smoke-test.sh",
        description: "Once you think you've solved the challenge, run the smoke test to verify your solution.",
      },
      metaDescription: "The Modular Metropolis: A senior engineer wrote the tests first and then left. The module code is buggy and the integration test is incomplete. Fix the...",
    },
    {
      id: "expert",
      name: "The Guardian Protocols",
      difficulty: "Expert",
      topics: ["OpenTofu", "GitHub Actions", "Trivy"],
      learnings: [
        "GitHub Actions for drift detection and plan/apply",
        "Integration tests with service containers",
        "Security scanning with Trivy",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_03-expert%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-02-building-cloudhaven-expert-the-guardian-protocols/782/8`,
      deadline: "2026-02-04T23:59:00+01:00",
      intro: [
        "Three broken GitHub Actions workflows stand between CloudHaven and automated infrastructure governance. Fix drift detection that creates PRs, <abbr data-title=\"Pull Request\" tabindex=\"0\" aria-describedby=\"abbr-exp-49\">PR</abbr><span id=\"abbr-exp-49\" class=\"sr-only\">Pull Request</span> validation with Trivy security scanning and service-container integration tests, and automatic apply on merge.",
      ],
      backstory: [
        "After the Modular Metropolis refactoring, CloudHaven flourished. But with growth came risk. One night, a rogue change slipped through unnoticed and nearly brought down the North Market's trading vaults. The Council was furious: how could this happen without anyone noticing?",
        "The Guild Master summoned you urgently. \"We need guardians,\" she said. \"Automated sentinels that watch over our infrastructure day and night. They must catch dangerous changes before they reach the city, detect when reality drifts from our blueprints, and sound the alarm when threats appear.\"",
        "A previous engineer began building these Guardian Protocols using GitHub Actions, but was reassigned before completing them. The workflows exist, but they're incomplete and broken.",
        "Your mission: bring the Guardian Protocols online and protect CloudHaven from chaos.",
      ],
      objective: [
        "Drift detection: run tofu plan and create a PR when drift is found",
        "PR validation: run tofu plan and comment results, run integration tests against the mock GCP API, scan for security vulnerabilities with Trivy and fail on critical or high severity issues",
        "Automatic apply: apply infrastructure when a PR is merged to main",
        "All three workflows must have succeeded at least once",
      ],
      toolbox: [
        { name: "tofu", description: "OpenTofu <abbr data-title=\"Command Line Interface\" tabindex=\"0\" aria-describedby=\"abbr-exp-50\">CLI</abbr><span id=\"abbr-exp-50\" class=\"sr-only\">Command Line Interface</span> for infrastructure provisioning", url: "https://opentofu.org/" },
        { name: "gcp-api-mock", description: "mock GCP API running locally (port set to public so GitHub Actions runners can access it)", url: "https://github.com/KatharinaSick/gcp-api-mock" },
        { name: "GitHub Actions", description: "the workflows you will fix are in .github/workflows/", url: "https://docs.github.com/en/actions" },
      ],
      howToPlay: [
        { title: "Wait for the Environment", content: "<p>Wait ~2 minutes for the environment to initialize.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 30104:</strong> GCP API Mock. Port is set to public so GitHub Actions runners can reach it during workflow runs. You may see a browser security warning. Click Continue to proceed.</li>
</ul>` },
        { title: "Fix the Workflows", content: `<p>Fix the three workflows in <code>.github/workflows/</code>:</p>
<ul>
<li><code>adventure02-expert-detect-drift.yaml</code></li>
<li><code>adventure02-expert-validate-changes.yaml</code></li>
<li><code>adventure02-expert-apply-infrastructure.yaml</code></li>
</ul>
<p>The OpenTofu configuration is correct, focus only on the workflow files.</p>` },
        { title: "Trigger Drift Detection", content: "<p>Commit and push to main. Go to the Actions tab, select the drift detection workflow, and click Run workflow. The infrastructure has intentional drift, so the workflow should create a draft PR.</p>" },
        { title: "Trigger Validation", content: "<p>Click Ready for Review on the draft PR to trigger the validation workflow. To re-trigger validation after pushing new changes, convert the PR back to draft then Ready for Review again. Re-running a failed workflow uses the code from the original run, so toggling draft state is how you pick up new changes pushed to main.</p>" },
        { title: "Merge and Apply", content: "<p>When the PR is merged to main, the apply workflow runs automatically.</p>" },
        { title: "Run the Smoke Test", content: `<p>Run the smoke test to verify your solution:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">cd adventures/02-building-cloudhaven/expert
./smoke-test.sh
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "GitHub Actions documentation", url: "https://docs.github.com/en/actions" },
        { title: "GitHub Actions service containers", url: "https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers" },
        { title: "OpenTofu plan command", url: "https://opentofu.org/docs/cli/commands/plan/" },
        { title: "Trivy action", url: "https://github.com/aquasecurity/trivy-action" },
        { title: "TF-via-PR action", url: "https://github.com/OP5dev/TF-via-PR" },
      ],
      verification: {
        command: "./smoke-test.sh",
        description: "Once you think you've solved the challenge, run the smoke test to verify your solution.",
      },
      metaDescription: "The Guardian Protocols: Three broken GitHub Actions workflows stand between CloudHaven and automated infrastructure governance. Fix drift detection that...",
    },
  ],
};
