/**
 * Static scenario data for RPG mode (originally from Supabase)
 */

export interface ScenarioOption {
  label: "A" | "B" | "C";
  type: "open_source" | "proprietary" | "hybrid";
  text: string;
  strategicResult: string;
  effects: {
    speed: number;
    cost: number;
    security: number;
    trust: number;
    adoption: number;
    scalability: number;
  };
}

export interface Scenario {
  id: string;
  scenarioNumber: number;
  title: string;
  context: string;
  scenarioType: string;
  difficulty: "easy" | "medium" | "hard";
  strategistVerdict: string;
  adversaryTypeId: string;
  options: ScenarioOption[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    scenarioNumber: 1,
    title: "The Cost Trap",
    context: "Your organization's Splunk license costs have spiraled to €500k/year. The vendor offers a 'discounted' renewal if you limit log ingestion, but this means reduced security visibility. Alternatively, you could migrate to Grafana + Loki, an open-source stack that requires upfront engineering investment but promises long-term savings.",
    scenarioType: "vendor_lock_in",
    difficulty: "easy",
    strategistVerdict: "Open Source shifts cost from licensing to engineering. The initial migration requires investment, but eliminates vendor lock-in and provides unlimited scalability. Organizations using OSS observability report 60-80% cost reduction over 3 years.",
    adversaryTypeId: "adv1",
    options: [
      {
        label: "A",
        type: "proprietary",
        text: "Negotiate with Vendor (Limit Data)",
        strategicResult: "Security Blindness — Limiting logs reduces visibility into potential security incidents.",
        effects: { speed: 5, cost: 10, security: -40, trust: -10, adoption: 0, scalability: -15 },
      },
      {
        label: "B",
        type: "open_source",
        text: "Migrate to Grafana (Open Source)",
        strategicResult: "Scale Efficiency — Eliminates vendor lock-in with unlimited scalability.",
        effects: { speed: 10, cost: 40, security: 10, trust: 15, adoption: 20, scalability: 30 },
      },
      {
        label: "C",
        type: "hybrid",
        text: "Run Both in Parallel",
        strategicResult: "Safe Transition — Reduces risk but doubles short-term costs.",
        effects: { speed: -5, cost: -10, security: 5, trust: 5, adoption: 10, scalability: 10 },
      },
    ],
  },
  {
    id: "s2",
    scenarioNumber: 2,
    title: "The Compliance Rush",
    context: "NIS2 deadline is in 90 days. A consultancy offers a 'fast-track' compliance package for €200k that promises certification but uses proprietary tools. Your OSPO suggests building on existing open-source compliance frameworks (OpenSSF, SBOM tools) which takes longer but creates reusable processes.",
    scenarioType: "compliance",
    difficulty: "medium",
    strategistVerdict: "Building on open-source compliance frameworks creates transferable knowledge and reusable pipelines. The initial time investment pays dividends as each new regulation becomes easier to address.",
    adversaryTypeId: "adv2",
    options: [
      {
        label: "A",
        type: "proprietary",
        text: "Buy Fast-Track Package",
        strategicResult: "Compliance Theater — Satisfies auditors temporarily but doesn't build real security culture.",
        effects: { speed: 15, cost: -30, security: 5, trust: -10, adoption: -5, scalability: -20 },
      },
      {
        label: "B",
        type: "open_source",
        text: "Build with Open Source Frameworks",
        strategicResult: "Sustainable Compliance — Creates transferable knowledge and reusable pipelines.",
        effects: { speed: -10, cost: 15, security: 30, trust: 20, adoption: 15, scalability: 25 },
      },
      {
        label: "C",
        type: "hybrid",
        text: "Use OSS Framework with External Advisor",
        strategicResult: "Guided Transition — Balances speed with long-term capability building.",
        effects: { speed: 5, cost: -5, security: 20, trust: 10, adoption: 10, scalability: 15 },
      },
    ],
  },
  {
    id: "s3",
    scenarioNumber: 3,
    title: "The AI Security Gate",
    context: "Developers want to use GitHub Copilot and ChatGPT for coding. Legal is concerned about code leakage and IP exposure. You can either ban AI tools entirely (frustrating developers) or implement an open-source AI gateway that monitors and controls AI tool usage.",
    scenarioType: "ai_governance",
    difficulty: "hard",
    strategistVerdict: "Open-source AI gateways provide visibility into AI usage, filter sensitive data before it leaves your network, and create audit trails for compliance. This 'trust but verify' approach enables innovation while managing risk.",
    adversaryTypeId: "adv3",
    options: [
      {
        label: "A",
        type: "proprietary",
        text: "Ban All AI Coding Tools",
        strategicResult: "Shadow AI Crisis — Developers use personal accounts, creating unmonitored shadow AI.",
        effects: { speed: -35, cost: 0, security: 10, trust: -25, adoption: -30, scalability: -10 },
      },
      {
        label: "B",
        type: "open_source",
        text: "Deploy Open Source AI Gateway",
        strategicResult: "Controlled Innovation — Enables innovation while managing risk.",
        effects: { speed: 25, cost: -5, security: 20, trust: 25, adoption: 30, scalability: 20 },
      },
      {
        label: "C",
        type: "hybrid",
        text: "Phased Rollout with Monitoring",
        strategicResult: "Progressive Enablement — Start small and expand based on data.",
        effects: { speed: 10, cost: -5, security: 15, trust: 15, adoption: 15, scalability: 15 },
      },
    ],
  },
  {
    id: "s4",
    scenarioNumber: 4,
    title: "Supply Chain Crisis",
    context: "A critical vulnerability is discovered in a widely-used open-source library embedded deep in your stack. Vendor X offers an 'immediate patch service' for €50k. Alternatively, your team could use open-source SBOM tools to map dependencies and contribute to the upstream fix.",
    scenarioType: "supply_chain",
    difficulty: "medium",
    strategistVerdict: "Using SBOM tools to map your exposure builds institutional knowledge. Contributing to upstream fixes improves the entire ecosystem and establishes your organization as a good open-source citizen.",
    adversaryTypeId: "adv2",
    options: [
      {
        label: "A",
        type: "proprietary",
        text: "Pay for Emergency Patch Service",
        strategicResult: "Vendor Dependency — Creates a recurring cost pattern without addressing root cause.",
        effects: { speed: 15, cost: -25, security: 5, trust: -5, adoption: -10, scalability: -5 },
      },
      {
        label: "B",
        type: "open_source",
        text: "Map with SBOM & Contribute Upstream",
        strategicResult: "Community Resilience — Builds institutional knowledge and ecosystem reputation.",
        effects: { speed: -5, cost: 10, security: 35, trust: 25, adoption: 20, scalability: 15 },
      },
      {
        label: "C",
        type: "hybrid",
        text: "Patch Now, Build SBOM Pipeline After",
        strategicResult: "Pragmatic Response — Addresses immediate risk while planning for the future.",
        effects: { speed: 10, cost: -10, security: 20, trust: 10, adoption: 5, scalability: 10 },
      },
    ],
  },
];

export type MiniGameType = "standardBattle" | "speedDuel" | "bossChallenge";

export const fakeLeaderboard = [
  { rank: 1, name: "OSPO_Master", score: 890, badge: "🏆" },
  { rank: 2, name: "Astra_EU", score: 845, badge: "🥈" },
  { rank: 3, name: "RootUser42", score: 780, badge: "🥉" },
  { rank: 4, name: "H4ckerOSPO", score: 720, badge: "⭐" },
  { rank: 5, name: "NIS2_Champion", score: 695, badge: "⭐" },
];
