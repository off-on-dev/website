import { useReducer, useCallback, useMemo } from "react";
import {
  OpenFutureGameState, TurnPhase, TeamMember, GameEvent, ResourceEffect, ExecutionResult, OngoingEffect, ActiveAction, DecisionRecord, QuarterlyMetrics, FailureType, VictoryPath, MaturityGridState, TechTreeState,
} from "@/data/simulator/openFutureTypes";
import { EVENT_CATALOG } from "@/data/simulator/openFutureEvents";
import { STRATEGIC_ACTIONS, VICTORY_CONDITIONS, TECH_TREE_NODES } from "@/data/simulator/openFutureActions";

const INITIAL_TEAM: TeamMember[] = [
  { id: "tm1", name: "You", skills: { compliance: 1, engineering: 1, community: 1, strategy: 2, security: 1 }, morale: 70, assignment: null, quartersSinceHired: 0 },
  { id: "tm2", name: "Alex (Generalist)", skills: { compliance: 1, engineering: 0, community: 1, strategy: 0, security: 0 }, morale: 80, assignment: null, quartersSinceHired: 0 },
];

const INITIAL_STATE: OpenFutureGameState = {
  phase: "opening", currentQuarter: 1, currentYear: 1, budgetAnnual: 300, budgetQuarterly: 75, budgetRemaining: 75,
  allocation: { headcount: 45, tools: 10, events: 5, training: 5, sponsorship: 0, reserve: 10 },
  headcount: [...INITIAL_TEAM], reputation: 20, politicalCapital: 30,
  techTree: { compliance: 0, security: 0, devex: 0, community: 0, inProgress: [] },
  maturityGrid: { governance: 0, strategy: 0, community: 0, security: 0, culture: 0 },
  currentEvents: [], resolvedEventIds: [], availableActions: [], selectedActions: [], activeActions: [], pendingEvents: [],
  decisions: [], metrics: [], completedEventIds: [],
  victoryProgress: { communityChampion: [], strategicEnabler: [], sovereigntyArchitect: [], ecosystemBuilder: [] },
  achievedVictory: null, failureType: null, failureReason: "", executionResults: [], ongoingEffects: [],
  upstreamContributions: 0, vendorLockInReductions: 0, regulatoryEventsSurvived: 0, crossCompanyInitiatives: 0,
  foundationProjectLevel: 0, maintainerRoles: 0, budgetIncreases: 0, externalParticipants: 0,
  innerSourceOperational: false, openStandardContribution: false, organizationPartnerships: 0,
};

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

export function getQuarterYear(quarter: number) {
  return { year: Math.ceil(quarter / 4), q: ((quarter - 1) % 4) + 1 };
}

function checkPrereqs(state: OpenFutureGameState, prereqs?: any[]): boolean {
  if (!prereqs?.length) return true;
  return prereqs.every(p => {
    switch (p.type) {
      case "reputation": return state.reputation >= (p.minValue || 0);
      case "politicalCapital": return state.politicalCapital >= (p.minValue || 0);
      case "techTree": return (state.techTree as any)[p.target] >= (p.minValue || 0);
      case "maturity": return (state.maturityGrid as any)[p.target] >= (p.minValue || 0);
      case "event": return state.completedEventIds.includes(p.eventId || "");
      default: return true;
    }
  });
}

function drawEvents(state: OpenFutureGameState): GameEvent[] {
  const available = EVENT_CATALOG.filter(e => {
    if (state.completedEventIds.includes(e.id)) return false;
    if (state.currentQuarter < e.earliestQuarter || state.currentQuarter > e.latestQuarter) return false;
    return checkPrereqs(state, e.prerequisites);
  });
  const guaranteed = available.filter(e => e.probability >= 1);
  const probabilistic = available.filter(e => e.probability < 1).filter(() => Math.random() < 0.4);
  const drawn = [...guaranteed];
  for (const e of probabilistic) { if (Math.random() < e.probability && drawn.length < 3) drawn.push(e); }
  return drawn.slice(0, 3);
}

function applyEffects(state: OpenFutureGameState, effects: ResourceEffect): OpenFutureGameState {
  const s = { ...state };
  if (effects.budget) s.budgetRemaining = clamp(s.budgetRemaining + effects.budget, 0, 9999);
  if (effects.reputation) s.reputation = clamp(s.reputation + effects.reputation, 0, 100);
  if (effects.politicalCapital) s.politicalCapital = clamp(s.politicalCapital + effects.politicalCapital, 0, 100);
  if (effects.morale) s.headcount = s.headcount.map(m => ({ ...m, morale: clamp(m.morale + (effects.morale || 0), 0, 100) }));
  return s;
}

function getAvailableActions(state: OpenFutureGameState): string[] {
  return STRATEGIC_ACTIONS.filter(a => {
    if (state.activeActions.some(aa => aa.actionId === a.id)) return false;
    if (a.unlockQuarter && state.currentQuarter < a.unlockQuarter) return false;
    return checkPrereqs(state, a.prerequisites);
  }).map(a => a.id);
}

function checkVictory(state: OpenFutureGameState): VictoryPath | null {
  for (const [path, config] of Object.entries(VICTORY_CONDITIONS)) {
    if (config.conditions.every((c: any) => c.check(state))) return path as VictoryPath;
  }
  return null;
}

function checkFailure(state: OpenFutureGameState): { type: FailureType; reason: string } | null {
  if (state.budgetRemaining <= 0 && state.politicalCapital < 10) return { type: "dissolved", reason: "The OSPO budget has been cut to zero." };
  if (state.reputation <= 0) return { type: "reputationCollapse", reason: "Your open source reputation has collapsed." };
  if (state.headcount.length > 0 && state.headcount.every(m => m.morale < 20)) return { type: "burnoutCascade", reason: "Every team member has reached critical burnout." };
  return null;
}

function updateMaturity(state: OpenFutureGameState): MaturityGridState {
  const g = { ...state.maturityGrid };
  if (g.governance < 1 && state.completedEventIds.some(id => ["E002A", "E003A"].includes(id))) g.governance = 1;
  if (g.governance < 2 && state.techTree.compliance >= 2 && state.politicalCapital >= 30) g.governance = 2;
  if (g.governance < 3 && state.techTree.compliance >= 3 && state.politicalCapital >= 50) g.governance = 3;
  if (g.strategy < 1 && state.politicalCapital >= 25) g.strategy = 1;
  if (g.strategy < 2 && state.politicalCapital >= 40 && state.currentQuarter >= 6) g.strategy = 2;
  if (g.strategy < 3 && state.politicalCapital >= 55 && state.currentQuarter >= 12) g.strategy = 3;
  if (g.strategy < 4 && state.politicalCapital >= 70 && state.currentQuarter >= 16) g.strategy = 4;
  if (g.community < 1 && state.reputation >= 25) g.community = 1;
  if (g.community < 2 && state.reputation >= 40 && state.upstreamContributions >= 2) g.community = 2;
  if (g.community < 3 && state.reputation >= 60 && state.maintainerRoles >= 1) g.community = 3;
  if (g.community < 4 && state.reputation >= 80 && state.maintainerRoles >= 3) g.community = 4;
  if (g.security < 1 && state.techTree.security >= 1) g.security = 1;
  if (g.security < 2 && state.techTree.security >= 2) g.security = 2;
  if (g.security < 3 && state.techTree.security >= 3) g.security = 3;
  if (g.security < 4 && state.techTree.security >= 4) g.security = 4;
  if (g.culture < 1 && state.reputation >= 25 && state.headcount.some(m => m.morale >= 60)) g.culture = 1;
  if (g.culture < 2 && state.techTree.devex >= 2 && state.currentQuarter >= 8) g.culture = 2;
  if (g.culture < 3 && state.techTree.devex >= 3 && state.reputation >= 50) g.culture = 3;
  if (g.culture < 4 && state.reputation >= 75 && state.innerSourceOperational) g.culture = 4;
  return g;
}

type GameAction =
  | { type: "START_GAME" } | { type: "START_TURN" } | { type: "RESOLVE_EVENT"; eventId: string; optionId: string }
  | { type: "FINISH_EVENTS" } | { type: "SELECT_ACTIONS"; actionIds: string[] }
  | { type: "UPDATE_ALLOCATION"; allocation: OpenFutureGameState["allocation"] } | { type: "EXECUTE_TURN" }
  | { type: "FINISH_REFLECTION" } | { type: "INVEST_TECH"; branch: keyof Omit<TechTreeState, "inProgress">; level: number }
  | { type: "RESTART" } | { type: "HIRE"; name: string; primarySkill: string } | { type: "VIEW_DEBRIEF" };

function gameReducer(state: OpenFutureGameState, action: GameAction): OpenFutureGameState {
  switch (action.type) {
    case "START_GAME": return { ...state, phase: "briefing" };
    case "START_TURN": {
      const events = drawEvents(state);
      return { ...state, phase: events.length > 0 ? "event" : "strategy", currentEvents: events, resolvedEventIds: [], availableActions: getAvailableActions(state), selectedActions: [], executionResults: [] };
    }
    case "RESOLVE_EVENT": {
      const event = state.currentEvents.find(e => e.id === action.eventId);
      if (!event) return state;
      const option = event.options.find(o => o.id === action.optionId);
      if (!option) return state;
      let s = { ...state };
      if (option.budgetCost) s.budgetRemaining -= option.budgetCost;
      if (option.pcCost) s.politicalCapital = clamp(s.politicalCapital - option.pcCost, 0, 100);
      s = applyEffects(s, option.effects);
      if (option.risks) {
        for (const risk of option.risks) {
          if (Math.random() < risk.probability) {
            s = applyEffects(s, risk.effect);
            s.executionResults = [...s.executionResults, { source: event.name, description: risk.description, effects: risk.effect, type: "negative" }];
          }
        }
      }
      if (action.optionId.includes("E005C") || action.optionId.includes("E011")) s.vendorLockInReductions++;
      if (action.optionId.includes("E010A") || action.optionId.includes("E016")) s.regulatoryEventsSurvived++;
      if (action.optionId.includes("E022A")) { s.crossCompanyInitiatives++; s.organizationPartnerships++; }
      if (action.optionId.includes("E012A")) s.maintainerRoles++;
      s.resolvedEventIds = [...s.resolvedEventIds, event.id];
      s.completedEventIds = [...s.completedEventIds, event.id];
      s.decisions = [...s.decisions, { quarter: s.currentQuarter, type: "event", id: event.id, name: event.name, choiceLabel: option.label, choiceId: option.id }];
      if (s.currentEvents.every(e => s.resolvedEventIds.includes(e.id))) s.phase = "strategy";
      return s;
    }
    case "FINISH_EVENTS": return { ...state, phase: "strategy" };
    case "SELECT_ACTIONS": return { ...state, selectedActions: action.actionIds };
    case "UPDATE_ALLOCATION": return { ...state, allocation: action.allocation };
    case "INVEST_TECH": {
      const { branch, level } = action;
      if (level !== state.techTree[branch] + 1) return state;
      const node = TECH_TREE_NODES[branch]?.[level - 1];
      if (!node || state.budgetRemaining < node.budgetCost) return state;
      return { ...state, budgetRemaining: state.budgetRemaining - node.budgetCost, techTree: { ...state.techTree, inProgress: [...state.techTree.inProgress, { branch, targetLevel: level, quartersRemaining: node.buildTime, budgetInvested: node.budgetCost }] } };
    }
    case "EXECUTE_TURN": {
      let s = { ...state };
      const results: ExecutionResult[] = [...s.executionResults];
      for (const actionId of s.selectedActions) {
        const a = STRATEGIC_ACTIONS.find(x => x.id === actionId);
        if (!a) continue;
        s.budgetRemaining -= a.budgetCost;
        s.politicalCapital = clamp(s.politicalCapital - a.pcCost, 0, 100);
        s = applyEffects(s, a.effects);
        if (a.duration > 1) s.activeActions = [...s.activeActions, { actionId: a.id, quartersRemaining: a.duration - 1, name: a.name }];
        if (a.ongoingEffect) s.ongoingEffects = [...s.ongoingEffects, { sourceId: a.id, sourceName: a.name, effect: a.ongoingEffect, quartersRemaining: -1 }];
        if (a.id === "ACT011") s.vendorLockInReductions++;
        if (a.id === "ACT014") s.foundationProjectLevel++;
        if (a.id === "ACT016") s.innerSourceOperational = true;
        if (a.id === "ACT018") s.openStandardContribution = true;
        if (a.id === "ACT007") s.upstreamContributions += 2;
        s.decisions = [...s.decisions, { quarter: s.currentQuarter, type: "action", id: a.id, name: a.name, choiceLabel: a.name, choiceId: a.id }];
        results.push({ source: a.name, description: `Completed: ${a.description}`, effects: a.effects, type: "positive" });
      }
      const stillActive: ActiveAction[] = [];
      for (const aa of s.activeActions) {
        if (aa.quartersRemaining <= 1) results.push({ source: aa.name, description: `${aa.name} completed.`, effects: {}, type: "positive" });
        else stillActive.push({ ...aa, quartersRemaining: aa.quartersRemaining - 1 });
      }
      s.activeActions = stillActive;
      for (const oe of s.ongoingEffects) s = applyEffects(s, oe.effect);
      s.ongoingEffects = s.ongoingEffects.map(oe => oe.quartersRemaining === -1 ? oe : { ...oe, quartersRemaining: oe.quartersRemaining - 1 }).filter(oe => oe.quartersRemaining === -1 || oe.quartersRemaining > 0);
      const newTT = { ...s.techTree };
      newTT.inProgress = newTT.inProgress.map(b => ({ ...b, quartersRemaining: b.quartersRemaining - 1 })).filter(b => {
        if (b.quartersRemaining <= 0) { (newTT as any)[b.branch] = b.targetLevel; results.push({ source: "Tech Tree", description: `${b.branch} upgraded to L${b.targetLevel}`, effects: {}, type: "positive" }); return false; }
        return true;
      });
      s.techTree = newTT;
      const hasCommunity = s.selectedActions.some(id => STRATEGIC_ACTIONS.find(sa => sa.id === id)?.category === "community");
      if (!hasCommunity && s.reputation > 0) { s.reputation = clamp(s.reputation - 2, 0, 100); results.push({ source: "Reputation Decay", description: "No community engagement. Reputation declines.", effects: { reputation: -2 }, type: "negative" }); }
      if (s.allocation.training === 0) s.headcount = s.headcount.map(m => ({ ...m, morale: clamp(m.morale - 3, 0, 100) }));
      s.headcount = s.headcount.map(m => ({ ...m, quartersSinceHired: m.quartersSinceHired + 1 }));
      s.maturityGrid = updateMaturity(s);
      const avgMorale = s.headcount.reduce((sum, m) => sum + m.morale, 0) / Math.max(1, s.headcount.length);
      s.metrics = [...s.metrics, { quarter: s.currentQuarter, year: s.currentYear, budget: s.budgetRemaining, headcount: s.headcount.length, reputation: s.reputation, politicalCapital: s.politicalCapital, averageMorale: Math.round(avgMorale) }];
      if (s.currentQuarter % 4 === 0) {
        const pcFactor = s.politicalCapital > 50 ? 1.15 : s.politicalCapital > 30 ? 1.0 : 0.85;
        const newAnnual = Math.round(s.budgetAnnual * pcFactor);
        if (newAnnual > s.budgetAnnual) s.budgetIncreases++;
        s.budgetAnnual = newAnnual;
        s.budgetQuarterly = Math.round(newAnnual / 4);
        results.push({ source: "Annual Budget Review", description: `Budget ${pcFactor >= 1 ? "maintained" : "reduced"} to €${newAnnual}k/year.`, effects: {}, type: pcFactor >= 1 ? "positive" : "negative" });
      }
      s.executionResults = results;
      const failure = checkFailure(s);
      if (failure) return { ...s, phase: "gameover", failureType: failure.type, failureReason: failure.reason };
      if (s.currentQuarter >= 16) { const victory = checkVictory(s); if (victory) return { ...s, phase: "victory", achievedVictory: victory }; }
      return { ...s, phase: "execution" };
    }
    case "FINISH_REFLECTION": {
      const next = state.currentQuarter + 1;
      if (next > 20) return { ...state, phase: "debrief" };
      const { year } = getQuarterYear(next);
      return { ...state, phase: "briefing", currentQuarter: next, currentYear: year, budgetRemaining: state.budgetQuarterly, selectedActions: [], executionResults: [] };
    }
    case "HIRE": {
      if (state.budgetRemaining < 20) return state;
      const skill = action.primarySkill as any;
      const member: TeamMember = { id: `tm${Date.now()}`, name: action.name, skills: { compliance: skill === "compliance" ? 2 : 0, engineering: skill === "engineering" ? 2 : 0, community: skill === "community" ? 2 : 0, strategy: skill === "strategy" ? 2 : 0, security: skill === "security" ? 2 : 0 }, morale: 75, assignment: null, quartersSinceHired: 0 };
      return { ...state, headcount: [...state.headcount, member], budgetRemaining: state.budgetRemaining - 20, politicalCapital: clamp(state.politicalCapital - 5, 0, 100) };
    }
    case "VIEW_DEBRIEF": return { ...state, phase: "debrief" };
    case "RESTART": return { ...INITIAL_STATE, headcount: [...INITIAL_TEAM.map(m => ({ ...m }))] };
    default: return state;
  }
}

export function useOpenFutureGame() {
  const [state, dispatch] = useReducer(gameReducer, { ...INITIAL_STATE, headcount: [...INITIAL_TEAM.map(m => ({ ...m }))] });

  const actions = useMemo(() => ({
    startGame: () => dispatch({ type: "START_GAME" }),
    startTurn: () => dispatch({ type: "START_TURN" }),
    resolveEvent: (eventId: string, optionId: string) => dispatch({ type: "RESOLVE_EVENT", eventId, optionId }),
    finishEvents: () => dispatch({ type: "FINISH_EVENTS" }),
    selectActions: (actionIds: string[]) => dispatch({ type: "SELECT_ACTIONS", actionIds }),
    updateAllocation: (allocation: OpenFutureGameState["allocation"]) => dispatch({ type: "UPDATE_ALLOCATION", allocation }),
    executeTurn: () => dispatch({ type: "EXECUTE_TURN" }),
    finishReflection: () => dispatch({ type: "FINISH_REFLECTION" }),
    investTech: (branch: keyof Omit<TechTreeState, "inProgress">, level: number) => dispatch({ type: "INVEST_TECH", branch, level }),
    hire: (name: string, primarySkill: string) => dispatch({ type: "HIRE", name, primarySkill }),
    restart: () => dispatch({ type: "RESTART" }),
    viewDebrief: () => dispatch({ type: "VIEW_DEBRIEF" }),
  }), []);

  const availableStrategicActions = useMemo(() => STRATEGIC_ACTIONS.filter(a => state.availableActions.includes(a.id)), [state.availableActions]);

  return { state, actions, availableStrategicActions };
}

export { VICTORY_CONDITIONS };
