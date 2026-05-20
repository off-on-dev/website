import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import { KATHARINA_SICK } from "./contributors";
import type { Adventure } from "./types";

export const BUILDING_CLOUDHAVEN: Adventure = {
  id: "building-cloudhaven",
  title: "Building CloudHaven",
  month: "JAN 2026",
  story: "Join the Infrastructure Guild and modernize CloudHaven's infrastructure from manual provisioning to a self-service platform using Infrastructure as Code.",
  tags: ["OpenTofu", "Terraform", "GitHub Actions", "Trivy", "TDD"],
  contributor: KATHARINA_SICK,
  levels: [
    {
      id: "beginner",
      name: "The Foundation Stones",
      difficulty: "Beginner",
      learnings: ["Infrastructure as Code with OpenTofu", "Remote state management with GCS backend", "Dynamic & conditional resources"],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_01-beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/practice-infrastructure-as-code-with-zero-setup-adventure-02-beginner/656`,
      backstory: [
        "The Merchant's Quarter needs essential services, but the previous Guild engineer left the OpenTofu configuration incomplete and misconfigured. Your mission: fix the issues, complete the setup, and establish proper infrastructure management for the Guild.",
      ],
      objective: [
        "Provision storage vaults and ledger databases for each district dynamically",
        "Deploy the audit database only when there is more than one district",
        "Store state remotely in a GCS backend following best practices so the Guild can collaborate",
        "Resolve all TODOs in the code and successfully run tofu apply",
      ],
      toolbox: [
        { name: "tofu", description: "OpenTofu CLI for infrastructure provisioning", url: "https://opentofu.org/" },
        { name: "gcp-api-mock", description: "mock GCP API running locally to simulate cloud resources without real cloud costs (Cloud Storage and Cloud SQL only)", url: "https://github.com/KatharinaSick/gcp-api-mock" },
      ],
      howToPlay: [
        { title: "Wait for the Environment", body: "Wait ~2 minutes for the environment to initialize." },
        { title: "Explore the Mock API", body: "Open the Ports tab, find the GCP API Mock at port 30104. Use it to explore the mock cloud resources created by your configuration." },
        { title: "Find the TODOs", body: "All OpenTofu files are in `adventures/02-building-cloudhaven/beginner/`. Run:\n\n```sh\ngrep -r \"TODO\" .\n```\n\nFiles to review: `main.tf`, `state.tf`, `variables.tf`, `merchants.tf`, `audit.tf`, `outputs.tf`." },
        { title: "Apply the Configuration", body: "After fixing the TODOs, run:\n\n```sh\ntofu apply\n```\n\nIf you changed the backend configuration, run `tofu init -migrate-state` first." },
        { title: "Run the Smoke Test", body: "Run the smoke test to verify your solution:\n\n```sh\n./smoke-test.sh\n```" },
      ],
    },
    {
      id: "intermediate",
      name: "The Modular Metropolis",
      difficulty: "Intermediate",
      learnings: ["OpenTofu module testing with tofu test", "Test-Driven Development (TDD) workflow", "Input validation with regex"],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_02-intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-02-building-cloudhaven-intermediate-the-modular-metropolis/723/10`,
      backstory: [
        "After fixing the Foundation Stones, CloudHaven is thriving. The city has grown to three districts, and the Guild decided to refactor the infrastructure into reusable modules.",
        "A senior engineer started the work using Test-Driven Development, writing tests first then implementing. But they were called away before finishing, leaving behind working tests and buggy code that doesn't match them. Your mission: fix the bugs, complete the integration test, and deploy the infrastructure.",
      ],
      objective: [
        "All tests of the districts module pass",
        "A completed integration test that applies infrastructure against the mock GCP API to verify end-to-end functionality",
        "Three districts deployed with correctly configured infrastructure (vaults and ledgers)",
      ],
      toolbox: [
        { name: "tofu", description: "OpenTofu CLI for infrastructure provisioning", url: "https://opentofu.org/" },
        { name: "gcp-api-mock", description: "mock GCP API running locally to simulate cloud resources without real cloud costs (Cloud Storage and Cloud SQL only)", url: "https://github.com/KatharinaSick/gcp-api-mock" },
      ],
      howToPlay: [
        { title: "Wait for the Environment", body: "Wait ~2 minutes for the environment to initialize." },
        { title: "Explore the Mock API", body: "Open the Ports tab, find the GCP API Mock at port 30104. Use it to explore mock cloud resources." },
        { title: "Fix the Failing Tests", body: "All files are in `adventures/02-building-cloudhaven/intermediate/`. The tests define the expected behaviour: your job is to fix the implementation to match what the tests expect. Don't modify existing tests unless a comment tells you to.\n\nStructure:\n\n```\nmodules/district/       # The district module (fix bugs here)\n  tests/                # Module tests (read these!)\ntests/\n  integration.tftest.hcl  # Complete this test\n```\n\nRun tests to see what fails:\n\n```sh\nmake test\n```" },
        { title: "Apply the Infrastructure", body: "Once all tests pass, apply the infrastructure:\n\n```sh\nmake test\nmake apply\n```" },
        { title: "Run the Smoke Test", body: "Run the smoke test to verify your solution:\n\n```sh\n./smoke-test.sh\n```" },
      ],
    },
    {
      id: "expert",
      name: "The Guardian Protocols",
      difficulty: "Expert",
      learnings: ["GitHub Actions for drift detection and plan/apply", "Integration tests with service containers", "Security scanning with Trivy"],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F02-building-cloudhaven_03-expert%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/adventure-02-building-cloudhaven-expert-the-guardian-protocols/782/8`,
      backstory: [
        "After the Modular Metropolis refactoring, CloudHaven flourished. But with growth came risk. One night, a rogue change slipped through unnoticed and nearly brought down the North Market's trading vaults. The Council was furious: how could this happen without anyone noticing?",
        "The Guild Master summoned you urgently. \"We need guardians,\" she said. \"Automated sentinels that watch over our infrastructure day and night. They must catch dangerous changes before they reach the city, detect when reality drifts from our blueprints, and sound the alarm when threats appear.\"",
        "A previous engineer began building these Guardian Protocols using GitHub Actions, but was reassigned before completing them. The workflows exist, but they're incomplete and broken. Your mission: bring the Guardian Protocols online and protect CloudHaven from chaos.",
      ],
      objective: [
        "Drift detection: run tofu plan and create a PR when drift is found",
        "PR validation: run tofu plan and comment results, run integration tests against the mock GCP API, scan for security vulnerabilities with Trivy and fail on critical or high severity issues",
        "Automatic apply: apply infrastructure when a PR is merged to main",
        "All three workflows must have succeeded at least once",
      ],
      toolbox: [
        { name: "tofu", description: "OpenTofu CLI for infrastructure provisioning", url: "https://opentofu.org/" },
        { name: "gcp-api-mock", description: "mock GCP API running locally (port set to public so GitHub Actions runners can access it)", url: "https://github.com/KatharinaSick/gcp-api-mock" },
        { name: "GitHub Actions", description: "the workflows you will fix are in .github/workflows/", url: "https://docs.github.com/en/actions" },
      ],
      howToPlay: [
        { title: "Wait for the Environment", body: "Wait ~2 minutes for the environment to initialize." },
        { title: "Check the Mock API", body: "Open the Ports tab, find the GCP API Mock at port 30104. The port is set to public so GitHub Actions runners can reach the mock API during workflow runs." },
        { title: "Fix the Workflows", body: "Fix the three workflows in `.github/workflows/`:\n\n- `adventure02-expert-detect-drift.yaml`\n- `adventure02-expert-validate-changes.yaml`\n- `adventure02-expert-apply-infrastructure.yaml`\n\nThe OpenTofu configuration is correct, focus only on the workflow files." },
        { title: "Trigger Drift Detection", body: "Commit and push to main. Go to the Actions tab, select the drift detection workflow, and click Run workflow. The infrastructure has intentional drift, so the workflow should create a draft PR." },
        { title: "Trigger Validation", body: "Click Ready for Review on the draft PR to trigger the validation workflow. To re-trigger validation after pushing new changes, convert the PR back to draft then ready for review again." },
        { title: "Merge and Apply", body: "When the PR is merged to main, the apply workflow runs automatically." },
        { title: "Run the Smoke Test", body: "Run the smoke test to verify your solution:\n\n```sh\ncd adventures/02-building-cloudhaven/expert\n./smoke-test.sh\n```" },
      ],
    },
  ],
};
