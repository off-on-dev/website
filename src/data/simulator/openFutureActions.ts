import { StrategicAction } from "./openFutureTypes";

export const STRATEGIC_ACTIONS: StrategicAction[] = [
  { id: "ACT001", name: "Run License Audit", description: "Conduct a systematic review of all open source licenses used in production systems.", category: "compliance", budgetCost: 10, headcountCost: 1, pcCost: 0, effects: { politicalCapital: 3 }, duration: 1 },
  { id: "ACT002", name: "Publish Contribution Guidelines", description: "Create and publish formal guidelines for how employees contribute to open source projects.", category: "community", budgetCost: 0, headcountCost: 1, pcCost: 0, effects: { reputation: 3 }, duration: 1 },
  { id: "ACT003", name: "Host Internal Open Source Workshop", description: "Run a workshop teaching engineers about open source best practices.", category: "strategy", budgetCost: 5, headcountCost: 1, pcCost: 0, effects: { politicalCapital: 5, morale: 5 }, duration: 1 },
  { id: "ACT004", name: "Set Up Basic Dependency Scanning", description: "Implement automated scanning for known vulnerabilities.", category: "security", budgetCost: 15, headcountCost: 0.5, pcCost: 0, effects: { politicalCapital: 3 }, duration: 1 },
  { id: "ACT005", name: "Create Internal Documentation", description: "Build an internal wiki with open source policies and best practices.", category: "tooling", budgetCost: 5, headcountCost: 1, pcCost: 0, effects: { morale: 3 }, duration: 1 },
  { id: "ACT006", name: "Propose Open Source Policy to Leadership", description: "Present a formal open source policy for company-wide adoption.", category: "strategy", budgetCost: 0, headcountCost: 1, pcCost: 10, effects: { politicalCapital: 15 }, duration: 1, prerequisites: [{ type: "maturity", target: "governance", minValue: 1 }], unlockQuarter: 3 },
  { id: "ACT007", name: "Launch Upstream Contribution Program", description: "Formalize a program for employees to contribute to upstream projects.", category: "community", budgetCost: 20, headcountCost: 2, pcCost: 5, effects: { reputation: 8 }, duration: 2, ongoingEffect: { reputation: 3 }, prerequisites: [{ type: "techTree", target: "community", minValue: 1 }], unlockQuarter: 4 },
  { id: "ACT008", name: "Build SBOM Pipeline", description: "Create infrastructure to generate and distribute Software Bills of Materials.", category: "security", budgetCost: 25, headcountCost: 1, pcCost: 0, effects: { politicalCapital: 5 }, duration: 2, prerequisites: [{ type: "techTree", target: "security", minValue: 2 }], unlockQuarter: 5 },
  { id: "ACT009", name: "Establish OSPO Advisory Board", description: "Create a formal advisory board to guide OSPO strategy.", category: "strategy", budgetCost: 5, headcountCost: 0.5, pcCost: 15, effects: { politicalCapital: 20 }, duration: 1, prerequisites: [{ type: "maturity", target: "strategy", minValue: 2 }, { type: "politicalCapital", minValue: 40 }], unlockQuarter: 6 },
  { id: "ACT010", name: "Run Community Contributor Sprint", description: "Organize an event to attract external contributors.", category: "community", budgetCost: 10, headcountCost: 1, pcCost: 0, effects: { reputation: 8 }, duration: 1, prerequisites: [{ type: "reputation", minValue: 40 }], unlockQuarter: 5 },
  { id: "ACT011", name: "Negotiate Vendor Exit Clause", description: "Renegotiate existing vendor contracts.", category: "strategy", budgetCost: 5, headcountCost: 0, pcCost: 10, effects: { politicalCapital: 5 }, duration: 1, prerequisites: [{ type: "maturity", target: "governance", minValue: 2 }], unlockQuarter: 6 },
  { id: "ACT012", name: "Write Executive Briefing on Digital Sovereignty", description: "Prepare a strategic briefing for leadership.", category: "strategy", budgetCost: 0, headcountCost: 1, pcCost: 0, effects: { politicalCapital: 8 }, duration: 1, prerequisites: [{ type: "maturity", target: "strategy", minValue: 1 }], unlockQuarter: 4 },
  { id: "ACT013", name: "Mentor Student Contributors", description: "Partner with universities to mentor student contributors.", category: "community", budgetCost: 5, headcountCost: 0.5, pcCost: 0, effects: { reputation: 3 }, duration: 1, prerequisites: [{ type: "reputation", minValue: 30 }], unlockQuarter: 4 },
  { id: "ACT014", name: "Submit Project to Foundation", description: "Submit one of your projects to a foundation's sandbox program.", category: "community", budgetCost: 15, headcountCost: 2, pcCost: 5, effects: { reputation: 20 }, duration: 3, prerequisites: [{ type: "reputation", minValue: 50 }, { type: "techTree", target: "community", minValue: 2 }], unlockQuarter: 9 },
  { id: "ACT015", name: "Build Developer Portal", description: "Create a self-service portal for engineers.", category: "tooling", budgetCost: 30, headcountCost: 2, pcCost: 0, effects: { morale: 10, politicalCapital: 5 }, duration: 2, prerequisites: [{ type: "techTree", target: "devex", minValue: 1 }], unlockQuarter: 5 },
  { id: "ACT016", name: "Launch Inner Source Program", description: "Create a framework for cross-team collaboration using open source practices.", category: "tooling", budgetCost: 20, headcountCost: 2, pcCost: 5, effects: { morale: 8, politicalCapital: 10 }, duration: 3, prerequisites: [{ type: "techTree", target: "devex", minValue: 2 }, { type: "maturity", target: "culture", minValue: 2 }], unlockQuarter: 10 },
  { id: "ACT017", name: "Implement Supply Chain Integrity", description: "Build signing, provenance tracking, and SLSA compliance.", category: "security", budgetCost: 40, headcountCost: 2, pcCost: 0, effects: { politicalCapital: 10, reputation: 5 }, duration: 3, prerequisites: [{ type: "techTree", target: "security", minValue: 3 }], unlockQuarter: 12 },
  { id: "ACT018", name: "Contribute to Open Standard", description: "Participate in developing an open standard.", category: "strategy", budgetCost: 10, headcountCost: 1, pcCost: 5, effects: { reputation: 12, politicalCapital: 5 }, duration: 2, prerequisites: [{ type: "reputation", minValue: 55 }, { type: "maturity", target: "governance", minValue: 2 }], unlockQuarter: 10 },
];

export const TECH_TREE_NODES = {
  compliance: [
    { level: 1, name: "License Scanner L1", description: "Basic license detection", budgetCost: 15, headcountCost: 0.5, buildTime: 1 },
    { level: 2, name: "License Scanner L2", description: "Automated remediation", budgetCost: 30, headcountCost: 1, buildTime: 2 },
    { level: 3, name: "Policy Automation", description: "Auto-approve or flag based on rules", budgetCost: 50, headcountCost: 1.5, buildTime: 2 },
    { level: 4, name: "Compliance Dashboard", description: "Real-time org-wide compliance visibility", budgetCost: 80, headcountCost: 2, buildTime: 3 },
  ],
  security: [
    { level: 1, name: "Basic CI/CD Integration", description: "Security checks in build pipeline", budgetCost: 15, headcountCost: 0.5, buildTime: 1 },
    { level: 2, name: "Dependency Scanning L1", description: "Automated vulnerability detection", budgetCost: 30, headcountCost: 1, buildTime: 2 },
    { level: 3, name: "SBOM Pipeline", description: "Generate and distribute SBOMs", budgetCost: 50, headcountCost: 1.5, buildTime: 2 },
    { level: 4, name: "Supply Chain Integrity", description: "Signing, provenance, SLSA L2", budgetCost: 80, headcountCost: 2, buildTime: 3 },
  ],
  devex: [
    { level: 1, name: "Internal Wiki", description: "Basic documentation and policy reference", budgetCost: 15, headcountCost: 0.5, buildTime: 1 },
    { level: 2, name: "Developer Portal L1", description: "Searchable catalog of approved components", budgetCost: 30, headcountCost: 1, buildTime: 2 },
    { level: 3, name: "Developer Portal L2", description: "Self-service onboarding", budgetCost: 50, headcountCost: 1.5, buildTime: 2 },
    { level: 4, name: "Inner Source Platform", description: "Cross-team collaboration engine", budgetCost: 80, headcountCost: 2, buildTime: 3 },
  ],
  community: [
    { level: 1, name: "Community Presence L1", description: "Blog, social media, basic visibility", budgetCost: 15, headcountCost: 0.5, buildTime: 1 },
    { level: 2, name: "Upstream Contribution Program", description: "Formal framework for contributing", budgetCost: 30, headcountCost: 1, buildTime: 2 },
    { level: 3, name: "Foundation Project L1", description: "Submit a project to a foundation sandbox", budgetCost: 50, headcountCost: 1.5, buildTime: 2 },
    { level: 4, name: "Foundation Project L2", description: "Project accepted to incubation", budgetCost: 80, headcountCost: 2, buildTime: 3 },
  ],
};

export const MATURITY_LEVELS = {
  governance: [
    { level: 0, name: "Ad-hoc", description: "No formal policy" },
    { level: 1, name: "Aware", description: "Basic license policy exists" },
    { level: 2, name: "Managed", description: "Contribution policy + review process" },
    { level: 3, name: "Strategic", description: "Governance framework with decision rights" },
    { level: 4, name: "Embedded", description: "Open source is part of architecture review" },
  ],
  strategy: [
    { level: 0, name: "Ad-hoc", description: "Reactive / ticket-driven" },
    { level: 1, name: "Aware", description: "OSPO has a charter" },
    { level: 2, name: "Managed", description: "Annual strategy aligned to business goals" },
    { level: 3, name: "Strategic", description: "OSPO influences product roadmap" },
    { level: 4, name: "Embedded", description: "Open source is a core pillar" },
  ],
  community: [
    { level: 0, name: "Ad-hoc", description: "No external engagement" },
    { level: 1, name: "Aware", description: "Occasional conference attendance" },
    { level: 2, name: "Managed", description: "Regular upstream contributions" },
    { level: 3, name: "Strategic", description: "Active maintainer roles" },
    { level: 4, name: "Embedded", description: "Recognized ecosystem leader" },
  ],
  security: [
    { level: 0, name: "Ad-hoc", description: "No supply chain awareness" },
    { level: 1, name: "Aware", description: "Basic vulnerability scanning" },
    { level: 2, name: "Managed", description: "SBOM generation; dependency tracking" },
    { level: 3, name: "Strategic", description: "Proactive security posture" },
    { level: 4, name: "Embedded", description: "Security-by-default across all usage" },
  ],
  culture: [
    { level: 0, name: "Ad-hoc", description: "Open source seen as 'free stuff'" },
    { level: 1, name: "Aware", description: "Engineers aware of open source value" },
    { level: 2, name: "Managed", description: "Teams actively contribute" },
    { level: 3, name: "Strategic", description: "Open source is part of engineering identity" },
    { level: 4, name: "Embedded", description: "Company attracts talent via open source" },
  ],
};

export const VICTORY_CONDITIONS = {
  communityChampion: {
    name: "Community Champion", icon: "🏆",
    description: "Build an organization that is a recognized leader in the open source ecosystem.",
    conditions: [
      { label: "Reputation >= 85", check: (s: any) => s.reputation >= 85 },
      { label: "Community Maturity >= Level 4", check: (s: any) => s.maturityGrid.community >= 4 },
      { label: "Foundation project accepted", check: (s: any) => s.foundationProjectLevel >= 2 },
      { label: "Maintainer roles >= 3", check: (s: any) => s.maintainerRoles >= 3 },
    ],
  },
  strategicEnabler: {
    name: "Strategic Enabler", icon: "🏗️",
    description: "Transform your organization's technology strategy through open source.",
    conditions: [
      { label: "Strategy Maturity >= Level 4", check: (s: any) => s.maturityGrid.strategy >= 4 },
      { label: "Culture Maturity >= Level 3", check: (s: any) => s.maturityGrid.culture >= 3 },
      { label: "Political Capital >= 70", check: (s: any) => s.politicalCapital >= 70 },
      { label: ">= 3 tech branches at Level 3+", check: (s: any) => [s.techTree.compliance, s.techTree.security, s.techTree.devex, s.techTree.community].filter((v: number) => v >= 3).length >= 3 },
      { label: ">= 3 budget increases", check: (s: any) => s.budgetIncreases >= 3 },
    ],
  },
  sovereigntyArchitect: {
    name: "Sovereignty Architect", icon: "🌍",
    description: "Lead your organization toward digital sovereignty.",
    conditions: [
      { label: "Governance Maturity >= Level 3", check: (s: any) => s.maturityGrid.governance >= 3 },
      { label: "Security Maturity >= Level 3", check: (s: any) => s.maturityGrid.security >= 3 },
      { label: ">= 3 vendor lock-in reductions", check: (s: any) => s.vendorLockInReductions >= 3 },
      { label: ">= 2 regulatory events survived", check: (s: any) => s.regulatoryEventsSurvived >= 2 },
      { label: "Open standard contribution", check: (s: any) => s.openStandardContribution },
    ],
  },
  ecosystemBuilder: {
    name: "Ecosystem Builder", icon: "🌱",
    description: "Build something larger than your own organization.",
    conditions: [
      { label: "Reputation >= 75", check: (s: any) => s.reputation >= 75 },
      { label: "Community Maturity >= Level 3", check: (s: any) => s.maturityGrid.community >= 3 },
      { label: "Strategy Maturity >= Level 3", check: (s: any) => s.maturityGrid.strategy >= 3 },
      { label: ">= 2 cross-company initiatives", check: (s: any) => s.crossCompanyInitiatives >= 2 },
      { label: ">= 3 organization partnerships", check: (s: any) => s.organizationPartnerships >= 3 },
    ],
  },
};
