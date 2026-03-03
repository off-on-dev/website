export interface StrategicTurnOption {
  id: string;
  shortLabel: string;
  text: string;
}

export interface StrategicTurnData {
  turnNumber: number;
  year: number;
  narrative: string;
  options: StrategicTurnOption[];
}

// Hidden dynamics that affect the game (not shown to player)
export interface HiddenDynamics {
  developerTrust: number;
  executiveConfidence: number;
  legalExposure: number;
  ecosystemInfluence: number;
  technologyDependency: number;
  longTermOptionality: number;
}

export interface StrategicDecision {
  turnNumber: number;
  optionId: string;
  shortLabel: string;
}

export interface StrategicGameState {
  currentTurn: number;
  decisions: StrategicDecision[];
  dynamics: HiddenDynamics;
  feedback: string[];
}

export const STARTING_CONTEXT = `You lead the Open Source Program Office of a European software company with roughly 1,200 employees.

The company builds a B2B SaaS platform used by regulated customers across healthcare, finance, and the public sector. Growth has been strong, but so has reliance on external cloud services, AI tooling, and third-party platforms.

Your role exists, but it is still loosely defined. You do not control budgets or roadmaps. You influence decisions through trust, framing, and timing.

Your mandate is simple on paper: "handle open source topics." In practice, leadership expects something more, but has not agreed on what that means.

Current state of the organization:
- Most production workloads run on large non-European cloud providers
- Several teams are integrating AI features through third-party APIs
- Open source is widely used, but rarely contributed to
- Legal is preparing for upcoming European regulation
- Security wants more visibility into dependencies
- Engineering leadership prioritizes speed and hiring velocity

Digital sovereignty appears in strategy decks, but no shared definition exists inside the company.

You are asked to clarify what the OSPO should focus on next.`;

const TURN_1: StrategicTurnData = {
  turnNumber: 1,
  year: 2025,
  narrative: `Executive leadership asks you to propose a clear focus for the OSPO for the coming year.\n\nThey want alignment, not a long presentation.`,
  options: [
    { id: "1a", shortLabel: "Compliance and Risk Management", text: "Position the OSPO as a compliance and risk management function. You focus on policies, approvals, and license reviews. Open source usage becomes more controlled and auditable. You work closely with legal and security to reduce exposure and prepare for regulation. The message is clear: risk first, speed second." },
    { id: "1b", shortLabel: "Strategic Advisory", text: "Position the OSPO as a strategic advisory function. You frame the OSPO as a partner for long-term technology decisions. You start mapping critical dependencies across cloud, AI, and open source. You advise teams on sovereignty risks and future exit costs. Compliance remains important, but it is not the headline." },
    { id: "1c", shortLabel: "Developer and Community Enablement", text: "Position the OSPO as a developer and community enablement function. You focus on internal education, contribution guidelines, and upstream engagement. Developers see the OSPO as support rather than oversight. Formal policies are intentionally light to avoid slowing teams down. Trust becomes your main currency." },
  ],
};

const TURN_2_VARIANTS: Record<string, StrategicTurnData> = {
  "1a": {
    turnNumber: 2, year: 2026,
    narrative: `A product group proposes a major AI-driven feature.\n\nThey want to integrate a powerful proprietary AI service hosted outside the EU. Competitors are already shipping similar functionality.\n\nData handling terms are unclear, but the business case is strong.\n\nLegal raises concerns. Security asks for guarantees. Product leadership wants to move quickly.\n\nYour compliance-focused positioning means teams expect you to weigh in on risk. The question is how hard you push.`,
    options: [
      { id: "2a_comply", shortLabel: "Require Strict Review", text: "Require strict review and limitations before adoption. You insist on clear data handling guarantees and contractual safeguards. You slow down the rollout until concerns are addressed." },
      { id: "2b_comply", shortLabel: "Allow with Transparency Requirements", text: "Allow adoption, but demand transparency and exit planning. You support the use of the AI service, but require documentation of data flows and dependency risks." },
      { id: "2c_comply", shortLabel: "Stay Hands-Off", text: "Stay hands-off and let teams decide. You provide general guidance but avoid formal involvement. Teams move fast and ship quickly." },
    ],
  },
  "1b": {
    turnNumber: 2, year: 2026,
    narrative: `A product group proposes a major AI-driven feature.\n\nThey want to integrate a powerful proprietary AI service hosted outside the EU.\n\nYour strategic advisory positioning means leadership looks to you for perspective on long-term implications. You have a seat at the table, but no veto power.`,
    options: [
      { id: "2a_strat", shortLabel: "Require Strict Review", text: "Require strict review and limitations before adoption." },
      { id: "2b_strat", shortLabel: "Allow with Transparency Requirements", text: "Allow adoption, but demand transparency and exit planning." },
      { id: "2c_strat", shortLabel: "Stay Hands-Off", text: "Stay hands-off and let teams decide." },
    ],
  },
  "1c": {
    turnNumber: 2, year: 2026,
    narrative: `A product group proposes a major AI-driven feature.\n\nYour enablement-focused positioning means developers trust you, but leadership may not think to involve you in strategic decisions. You need to decide whether to insert yourself.`,
    options: [
      { id: "2a_enable", shortLabel: "Require Strict Review", text: "Require strict review and limitations before adoption." },
      { id: "2b_enable", shortLabel: "Allow with Transparency Requirements", text: "Allow adoption, but demand transparency and exit planning." },
      { id: "2c_enable", shortLabel: "Stay Hands-Off", text: "Stay hands-off and let teams decide." },
    ],
  },
};

const TURN_3: StrategicTurnData = {
  turnNumber: 3, year: 2027,
  narrative: `New European data requirements come into force.\n\nAuditors request clear answers: where customer data is processed, who has access, and how easily services can be replaced.\n\nFor the first time, executive leadership asks the OSPO for a recommendation rather than a review.\n\nThe question is not whether changes are needed, but how disruptive they should be.`,
  options: [
    { id: "3a", shortLabel: "Minimal Changes for Compliance", text: "Recommend minimal changes to stay compliant. Existing providers remain in place with additional controls." },
    { id: "3b", shortLabel: "Gradual Shift Toward Sovereignty", text: "Recommend a gradual shift toward more sovereign-friendly options. Critical workloads are reviewed first. Exit paths are documented." },
    { id: "3c", shortLabel: "Strong Strategic Shift", text: "Advocate for a strong strategic shift. You push for rethinking cloud and AI dependencies, even at short-term cost." },
  ],
};

export const OPTION_EFFECTS: Record<string, Partial<HiddenDynamics>> = {
  "1a": { developerTrust: -15, executiveConfidence: 20, legalExposure: -25, ecosystemInfluence: -10, longTermOptionality: -5 },
  "1b": { developerTrust: 5, executiveConfidence: 10, legalExposure: -5, ecosystemInfluence: 10, longTermOptionality: 20 },
  "1c": { developerTrust: 25, executiveConfidence: -10, legalExposure: 10, ecosystemInfluence: 15, longTermOptionality: 5 },
  "2a_comply": { developerTrust: -20, executiveConfidence: 15, legalExposure: -25, technologyDependency: -15, longTermOptionality: 10 },
  "2b_comply": { developerTrust: -5, executiveConfidence: 10, legalExposure: -10, technologyDependency: 5, longTermOptionality: 15 },
  "2c_comply": { developerTrust: 10, executiveConfidence: -15, legalExposure: 20, technologyDependency: 25, longTermOptionality: -20 },
  "2a_strat": { developerTrust: -15, executiveConfidence: 10, legalExposure: -20, technologyDependency: -15, longTermOptionality: 15 },
  "2b_strat": { developerTrust: 5, executiveConfidence: 15, legalExposure: -5, technologyDependency: 10, longTermOptionality: 20 },
  "2c_strat": { developerTrust: 10, executiveConfidence: -10, legalExposure: 15, technologyDependency: 25, longTermOptionality: -15 },
  "2a_enable": { developerTrust: -25, executiveConfidence: 15, legalExposure: -15, technologyDependency: -10, longTermOptionality: 5 },
  "2b_enable": { developerTrust: 0, executiveConfidence: 5, legalExposure: -5, technologyDependency: 10, longTermOptionality: 10 },
  "2c_enable": { developerTrust: 15, executiveConfidence: -20, legalExposure: 25, technologyDependency: 30, longTermOptionality: -25 },
  "3a": { executiveConfidence: 15, legalExposure: -20, technologyDependency: 25, longTermOptionality: -30 },
  "3b": { developerTrust: -5, executiveConfidence: 5, legalExposure: -15, technologyDependency: -10, longTermOptionality: 20 },
  "3c": { developerTrust: -10, executiveConfidence: -10, legalExposure: -25, technologyDependency: -30, longTermOptionality: 35 },
};

export const FEEDBACK_MESSAGES: Record<string, string> = {
  "1a": "The compliance focus lands well with legal and security. Engineering sees new friction in their workflows, but leadership appreciates the reduced ambiguity.",
  "1b": "Your dependency mapping exercise reveals surprising gaps. Leadership listens, but has not yet acted. You are building credibility as someone who sees around corners.",
  "1c": "Developer sentiment toward the OSPO shifts noticeably. Teams start asking for guidance rather than avoiding you. But when legal asks for your license compliance status, you realize you do not have a clear answer.",
  "2a_comply": "The AI rollout slows. Legal is relieved. Product leadership is frustrated but cannot argue with the risk assessment.",
  "2b_comply": "The feature ships with documented caveats. Legal accepts the risk. You have begun building exit path documentation.",
  "2c_comply": "The feature ships quickly. Teams are happy. But when legal later asks about data flows, no one has clear answers.",
  "2a_strat": "Your intervention is respected but resented. The delay costs the product team a quarter.",
  "2b_strat": "The transparency requirements land well. Teams document their dependencies.",
  "2c_strat": "The feature ships. You watch from the sidelines.",
  "2a_enable": "The sudden shift in tone catches developers off guard. Your reputation for being supportive takes a hit.",
  "2b_enable": "The balanced approach preserves relationships. Developers accept the documentation requirements.",
  "2c_enable": "The feature ships fast. Developers are grateful. But when the auditors arrive next year, they will ask questions you cannot answer.",
  "3a": "", "3b": "", "3c": "",
};

export const POSTURE_OUTCOMES = {
  compliantDependent: { title: "Formally Compliant, Strategically Dependent", description: "Your organization meets regulatory requirements and has clear policies. But dependencies on non-European cloud and AI providers have deepened." },
  trustedExposed: { title: "Trusted Internally, Exposed Externally", description: "Developers see the OSPO as helpful and supportive. But the organization lacks visibility into its own dependencies." },
  sovereignSlow: { title: "Sovereignty-Aware, But Slow to Adapt", description: "Your organization understands the risks. Documentation exists. Exit paths are mapped. But meaningful change has not happened." },
  highControlLowFlex: { title: "High Control, Low Flexibility", description: "The OSPO is seen as a gatekeeper. Decisions pass through you. Risks are well-managed. But speed has suffered." },
  strategicOptional: { title: "Strategic and Optional", description: "Your organization has preserved optionality. Dependencies are documented. Exit paths exist. You can respond to change without crisis." },
};

export const LEARNING_OUTCOMES = [
  { observation: "OSPO influence is established before crises, not during them. The positioning choices made early determine what options exist later." },
  { observation: "Compliance alone does not create control. Meeting regulatory requirements and maintaining strategic flexibility are different goals that can conflict." },
  { observation: "Developer trust and strategic authority often pull in opposite directions." },
  { observation: "AI decisions create lock-in faster than cloud decisions." },
  { observation: "Digital sovereignty is built through visibility, not purity. Knowing your dependencies matters more than eliminating them." },
];

export const INITIAL_DYNAMICS: HiddenDynamics = {
  developerTrust: 0, executiveConfidence: 0, legalExposure: 0,
  ecosystemInfluence: 0, technologyDependency: 0, longTermOptionality: 0,
};

export const getTurn = (turnNumber: number, previousDecisions: StrategicDecision[]): StrategicTurnData => {
  if (turnNumber === 1) return TURN_1;
  if (turnNumber === 2) {
    const turn1 = previousDecisions.find((d) => d.turnNumber === 1);
    if (turn1 && TURN_2_VARIANTS[turn1.optionId]) return TURN_2_VARIANTS[turn1.optionId];
    return TURN_2_VARIANTS["1a"];
  }
  if (turnNumber === 3) return TURN_3;
  return TURN_1;
};

export const getFeedback = (optionId: string): string => FEEDBACK_MESSAGES[optionId] || "";

export const getOptionLabel = (optionId: string, turnData: StrategicTurnData): string => {
  const option = turnData.options.find((o) => o.id === optionId);
  return option?.shortLabel || "";
};
