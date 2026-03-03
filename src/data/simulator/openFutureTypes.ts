// Open Future: The OSPO Strategy Simulator — Type Definitions

export type SkillType = 'compliance' | 'engineering' | 'community' | 'strategy' | 'security';

export type TurnPhase = 'opening' | 'briefing' | 'event' | 'strategy' | 'execution' | 'reflection' | 'gameover' | 'victory' | 'debrief';

export type EventType = 'crisis' | 'opportunity' | 'slowburn' | 'politics' | 'ecosystem' | 'milestone' | 'story';

export type VictoryPath = 'communityChampion' | 'strategicEnabler' | 'sovereigntyArchitect' | 'ecosystemBuilder';

export type FailureType = 'dissolved' | 'reputationCollapse' | 'burnoutCascade';

export interface TeamMember {
  id: string;
  name: string;
  skills: Record<SkillType, number>;
  morale: number;
  assignment: string | null;
  quartersSinceHired: number;
}

export interface BudgetAllocation {
  headcount: number;
  tools: number;
  events: number;
  training: number;
  sponsorship: number;
  reserve: number;
}

export interface TechTreeState {
  compliance: number;
  security: number;
  devex: number;
  community: number;
  inProgress: TechBuild[];
}

export interface TechBuild {
  branch: keyof Omit<TechTreeState, 'inProgress'>;
  targetLevel: number;
  quartersRemaining: number;
  budgetInvested: number;
}

export interface MaturityGridState {
  governance: number;
  strategy: number;
  community: number;
  security: number;
  culture: number;
}

export interface ResourceEffect {
  budget?: number;
  reputation?: number;
  politicalCapital?: number;
  morale?: number;
  techBranch?: keyof Omit<TechTreeState, 'inProgress'>;
  techProgress?: number;
  maturityDimension?: keyof MaturityGridState;
  maturityProgress?: number;
}

export interface GameEvent {
  id: string;
  name: string;
  type: EventType;
  description: string;
  flavorText?: string;
  earliestQuarter: number;
  latestQuarter: number;
  probability: number;
  prerequisites?: EventPrerequisite[];
  options: EventOption[];
  insightCard?: InsightCard;
}

export interface EventPrerequisite {
  type: 'reputation' | 'politicalCapital' | 'techTree' | 'maturity' | 'event';
  target?: string;
  minValue?: number;
  maxValue?: number;
  eventId?: string;
}

export interface EventOption {
  id: string;
  label: string;
  description: string;
  effects: ResourceEffect;
  budgetCost?: number;
  pcCost?: number;
  headcountCost?: number;
  risks?: EventRisk[];
  requirements?: EventPrerequisite[];
}

export interface EventRisk {
  description: string;
  probability: number;
  effect: ResourceEffect;
}

export interface InsightCard {
  title: string;
  realWorldContext: string;
  expertAdvice: string;
  commonMistake: string;
}

export interface StrategicAction {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'tooling' | 'community' | 'strategy' | 'security';
  budgetCost: number;
  headcountCost: number;
  pcCost: number;
  effects: ResourceEffect;
  duration: number;
  prerequisites?: EventPrerequisite[];
  unlockQuarter?: number;
  ongoingEffect?: ResourceEffect;
}

export interface QuarterlyMetrics {
  quarter: number;
  year: number;
  budget: number;
  headcount: number;
  reputation: number;
  politicalCapital: number;
  averageMorale: number;
}

export interface ActiveAction {
  actionId: string;
  quartersRemaining: number;
  name: string;
}

export interface PendingEvent {
  eventId: string;
  deadlineQuarter: number;
  name: string;
}

export interface DecisionRecord {
  quarter: number;
  type: 'event' | 'action';
  id: string;
  name: string;
  choiceLabel: string;
  choiceId: string;
}

export interface VictoryCondition {
  label: string;
  met: boolean;
}

export interface VictoryProgress {
  communityChampion: VictoryCondition[];
  strategicEnabler: VictoryCondition[];
  sovereigntyArchitect: VictoryCondition[];
  ecosystemBuilder: VictoryCondition[];
}

export interface OpenFutureGameState {
  phase: TurnPhase;
  currentQuarter: number;
  currentYear: number;
  budgetAnnual: number;
  budgetQuarterly: number;
  budgetRemaining: number;
  allocation: BudgetAllocation;
  headcount: TeamMember[];
  reputation: number;
  politicalCapital: number;
  techTree: TechTreeState;
  maturityGrid: MaturityGridState;
  currentEvents: GameEvent[];
  resolvedEventIds: string[];
  availableActions: string[];
  selectedActions: string[];
  activeActions: ActiveAction[];
  pendingEvents: PendingEvent[];
  decisions: DecisionRecord[];
  metrics: QuarterlyMetrics[];
  completedEventIds: string[];
  victoryProgress: VictoryProgress;
  achievedVictory: VictoryPath | null;
  failureType: FailureType | null;
  failureReason: string;
  executionResults: ExecutionResult[];
  ongoingEffects: OngoingEffect[];
  upstreamContributions: number;
  vendorLockInReductions: number;
  regulatoryEventsSurvived: number;
  crossCompanyInitiatives: number;
  foundationProjectLevel: number;
  maintainerRoles: number;
  budgetIncreases: number;
  externalParticipants: number;
  innerSourceOperational: boolean;
  openStandardContribution: boolean;
  organizationPartnerships: number;
}

export interface ExecutionResult {
  source: string;
  description: string;
  effects: ResourceEffect;
  type: 'positive' | 'negative' | 'neutral';
}

export interface OngoingEffect {
  sourceId: string;
  sourceName: string;
  effect: ResourceEffect;
  quartersRemaining: number;
}
