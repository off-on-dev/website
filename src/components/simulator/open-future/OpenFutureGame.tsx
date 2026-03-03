import { useOpenFutureGame, getQuarterYear } from "@/hooks/useOpenFutureGame";
import { OpenFutureGameState } from "@/data/simulator/openFutureTypes";
import { OPENING_TEXT, COMPANY_PROFILE } from "@/data/simulator/openFutureEvents";
import { MATURITY_LEVELS, VICTORY_CONDITIONS, TECH_TREE_NODES, STRATEGIC_ACTIONS } from "@/data/simulator/openFutureActions";
import { useState } from "react";
import { Building2, Users, Euro, MapPin, TrendingUp, TrendingDown, Minus, ArrowRight, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Lock, Check, Plus, Hammer, XCircle, RotateCcw, Trophy, DollarSign, Star } from "lucide-react";

// Opening Screen
const OpeningScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="relative z-10 max-w-2xl w-full space-y-8">
      <div className="text-center">
        <h1 className="font-mono text-lg text-primary mb-2">Open Future</h1>
        <p className="font-mono text-xs text-muted-foreground">The OSPO Strategy Simulator</p>
      </div>
      <div className="sim-pixel-box p-6">
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="w-4 h-4 text-primary" /><span>{COMPANY_PROFILE.name}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4 text-primary" /><span>~{COMPANY_PROFILE.employees} employees</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Euro className="w-4 h-4 text-primary" /><span>{COMPANY_PROFILE.revenue}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" /><span>{COMPANY_PROFILE.hq}</span></div>
        </div>
      </div>
      <div className="sim-pixel-box p-6">
        <div className="font-mono text-sm text-foreground/90 leading-relaxed whitespace-pre-line italic">{OPENING_TEXT}</div>
      </div>
      <div className="text-center">
        <button onClick={onStart} className="sim-rpg-button text-sm px-8 py-3">BEGIN YEAR 1</button>
      </div>
    </div>
  </div>
);

// Resource Bar
const ResourceBar = ({ state }: { state: OpenFutureGameState }) => {
  const { year, q } = getQuarterYear(state.currentQuarter);
  const phaseLabels: Record<string, string> = { opening: "Opening", briefing: "Briefing", event: "Events", strategy: "Strategy", execution: "Execution", reflection: "Reflection", gameover: "Game Over", victory: "Victory", debrief: "Debrief" };
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-primary">Year {year} — Q{q}</div>
            <div className="font-mono text-xs text-muted-foreground">Turn {state.currentQuarter}/20</div>
            <div className="px-2 py-0.5 bg-primary/10 rounded text-xs font-mono text-primary">{phaseLabels[state.phase]}</div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-yellow-500" /><span>€{state.budgetRemaining}k</span></div>
            <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-500" /><span>{state.headcount.length}</span></div>
            <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-orange-500" /><span>{state.reputation}</span></div>
            <div className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-purple-500" /><span>{state.politicalCapital}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Briefing Phase
const BriefingPhase = ({ state, onStartTurn }: { state: OpenFutureGameState; onStartTurn: () => void }) => {
  const { year, q } = getQuarterYear(state.currentQuarter);
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center"><h2 className="font-mono text-sm text-primary mb-2">Quarterly Briefing</h2><p className="font-mono text-xs text-muted-foreground">Year {year}, Quarter {q}</p></div>
      <div className="sim-pixel-box p-6">
        <h3 className="font-mono text-xs text-foreground mb-3">Resources</h3>
        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
          <div><span className="text-muted-foreground text-xs">Budget</span><div>€{state.budgetRemaining}k / €{state.budgetQuarterly}k</div></div>
          <div><span className="text-muted-foreground text-xs">Team</span><div>{state.headcount.length} members</div></div>
          <div><span className="text-muted-foreground text-xs">Reputation</span><div>{state.reputation}/100</div><div className="w-full h-1.5 bg-muted rounded-full mt-1"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${state.reputation}%` }} /></div></div>
          <div><span className="text-muted-foreground text-xs">Political Capital</span><div>{state.politicalCapital}/100</div><div className="w-full h-1.5 bg-muted rounded-full mt-1"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${state.politicalCapital}%` }} /></div></div>
        </div>
      </div>
      <div className="text-center"><button onClick={onStartTurn} className="sim-rpg-button px-6 py-2 text-sm flex items-center gap-2 mx-auto">Start Quarter <ArrowRight className="w-4 h-4" /></button></div>
    </div>
  );
};

// Event Phase
const EventPhase = ({ state, onResolveEvent, onFinishEvents }: { state: OpenFutureGameState; onResolveEvent: (eventId: string, optionId: string) => void; onFinishEvents: () => void }) => {
  const currentEvent = state.currentEvents.find(e => !state.resolvedEventIds.includes(e.id));
  const allResolved = state.currentEvents.every(e => state.resolvedEventIds.includes(e.id));
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const typeColors: Record<string, string> = { crisis: "text-red-500", opportunity: "text-green-500", slowburn: "text-yellow-500", politics: "text-purple-500", ecosystem: "text-cyan-500", milestone: "text-primary", story: "text-primary" };

  if (allResolved) return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <h2 className="font-mono text-sm text-primary">Events Resolved</h2>
      <button onClick={onFinishEvents} className="sim-rpg-button px-6 py-2 text-sm flex items-center gap-2 mx-auto">Continue to Strategy <ArrowRight className="w-4 h-4" /></button>
    </div>
  );
  if (!currentEvent) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <span className={`font-mono text-xs ${typeColors[currentEvent.type] || "text-primary"}`}>{currentEvent.type.toUpperCase()}</span>
        <h2 className="font-mono text-sm text-foreground mt-1">{currentEvent.name}</h2>
      </div>
      <div className="sim-pixel-box p-6"><p className="font-mono text-sm text-foreground/90 leading-relaxed">{currentEvent.description}</p>{currentEvent.flavorText && <p className="font-mono text-xs text-muted-foreground mt-3 italic">{currentEvent.flavorText}</p>}</div>
      <div className="space-y-3">
        {currentEvent.options.map(option => {
          const canAfford = (option.budgetCost || 0) <= state.budgetRemaining && (option.pcCost || 0) <= state.politicalCapital;
          return (
            <button key={option.id} onClick={() => canAfford && onResolveEvent(currentEvent.id, option.id)} disabled={!canAfford}
              className={`w-full sim-pixel-box p-4 text-left transition-all ${canAfford ? "hover:border-primary/50 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
              <div className="font-mono text-xs text-foreground mb-1">{option.label}</div>
              <p className="font-mono text-xs text-muted-foreground">{option.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {option.budgetCost && option.budgetCost > 0 && <span className="text-xs font-mono text-yellow-500">-€{option.budgetCost}k</span>}
                {option.pcCost && option.pcCost > 0 && <span className="text-xs font-mono text-purple-500">-{option.pcCost} PC</span>}
                {option.risks?.length && <span className="text-xs font-mono text-yellow-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Risk</span>}
              </div>
            </button>
          );
        })}
      </div>
      {currentEvent.insightCard && (
        <div className="sim-pixel-box p-4">
          <button onClick={() => setExpandedInsight(expandedInsight === currentEvent.id ? null : currentEvent.id)} className="flex items-center gap-2 text-xs font-mono text-primary w-full">
            <Lightbulb className="w-4 h-4" /><span>What would an expert consider?</span>{expandedInsight === currentEvent.id ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>
          {expandedInsight === currentEvent.id && <div className="mt-3 space-y-2 text-xs font-mono text-muted-foreground"><p><strong className="text-foreground">Context:</strong> {currentEvent.insightCard.realWorldContext}</p><p><strong className="text-foreground">Expert:</strong> {currentEvent.insightCard.expertAdvice}</p><p><strong className="text-foreground">Mistake:</strong> {currentEvent.insightCard.commonMistake}</p></div>}
        </div>
      )}
    </div>
  );
};

// Strategy Phase (simplified)
const StrategyPhase = ({ state, availableActions, onSelectActions, onInvestTech, onHire, onExecute }: { state: OpenFutureGameState; availableActions: any[]; onSelectActions: (ids: string[]) => void; onInvestTech: (branch: any, level: number) => void; onHire: (name: string, skill: string) => void; onExecute: () => void }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(state.selectedActions);
  const maxActions = Math.min(4, Math.max(2, Math.floor(state.headcount.length / 1.5) + 1));
  const toggleAction = (id: string) => { const n = selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : selectedIds.length < maxActions ? [...selectedIds, id] : selectedIds; setSelectedIds(n); onSelectActions(n); };
  const totalCost = selectedIds.reduce((s, id) => s + (availableActions.find(a => a.id === id)?.budgetCost || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center"><h2 className="font-mono text-sm text-primary mb-1">Strategy Phase</h2><p className="font-mono text-xs text-muted-foreground">Choose up to {maxActions} actions. Budget: €{state.budgetRemaining}k</p></div>
      <div className="space-y-3">
        {availableActions.map(action => {
          const isSelected = selectedIds.includes(action.id);
          const canAfford = action.budgetCost <= state.budgetRemaining - totalCost + (isSelected ? action.budgetCost : 0);
          const canSelect = isSelected || (selectedIds.length < maxActions && canAfford);
          return (
            <button key={action.id} onClick={() => canSelect && toggleAction(action.id)} disabled={!canSelect && !isSelected}
              className={`w-full sim-pixel-box p-4 text-left transition-all ${isSelected ? "border-primary/50 bg-primary/5" : canSelect ? "hover:border-primary/30" : "opacity-40"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground"}`}>{isSelected && <Check className="w-3 h-3 text-primary-foreground" />}</div>
                <div className="flex-1">
                  <div className="font-mono text-xs text-foreground mb-1">{action.name}</div>
                  <p className="font-mono text-xs text-muted-foreground">{action.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {action.budgetCost > 0 && <span className="text-xs font-mono text-yellow-500">€{action.budgetCost}k</span>}
                    {action.pcCost > 0 && <span className="text-xs font-mono text-purple-500">{action.pcCost} PC</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="sim-pixel-box p-4">
        <button onClick={onExecute} className="sim-rpg-button w-full py-2 text-sm flex items-center justify-center gap-2">Execute Quarter <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

// Execution Phase
const ExecutionPhase = ({ results, onContinue }: { results: any[]; onContinue: () => void }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center"><h2 className="font-mono text-sm text-primary mb-1">Quarter Results</h2></div>
    <div className="space-y-3">
      {results.map((r: any, i: number) => (
        <div key={i} className="sim-pixel-box p-4">
          <div className="flex items-start gap-3">
            {r.type === "positive" ? <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" /> : r.type === "negative" ? <TrendingDown className="w-4 h-4 text-red-500 mt-0.5" /> : <Minus className="w-4 h-4 text-muted-foreground mt-0.5" />}
            <div><div className="font-mono text-xs text-foreground mb-1">{r.source}</div><p className="font-mono text-xs text-muted-foreground">{r.description}</p></div>
          </div>
        </div>
      ))}
      {results.length === 0 && <div className="text-center py-8 font-mono text-sm text-muted-foreground">A quiet quarter.</div>}
    </div>
    <div className="text-center"><button onClick={onContinue} className="sim-rpg-button px-6 py-2 text-sm flex items-center gap-2 mx-auto">Continue <ArrowRight className="w-4 h-4" /></button></div>
  </div>
);

// Game Over
const GameOverScreen = ({ state, onRestart }: { state: OpenFutureGameState; onRestart: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="max-w-lg text-center space-y-6">
      <XCircle className="w-16 h-16 text-destructive mx-auto" />
      <h1 className="font-mono text-lg text-destructive">{state.failureType === "dissolved" ? "OSPO Dissolved" : state.failureType === "reputationCollapse" ? "Reputation Collapse" : "Burnout Cascade"}</h1>
      <p className="font-mono text-sm text-foreground/80">{state.failureReason}</p>
      <button onClick={onRestart} className="sim-rpg-button px-6 py-2 text-sm flex items-center gap-2 mx-auto"><RotateCcw className="w-4 h-4" /> Try Again</button>
    </div>
  </div>
);

// Victory
const VictoryScreen = ({ state, onRestart, onDebrief }: { state: OpenFutureGameState; onRestart: () => void; onDebrief: () => void }) => {
  const vc = VICTORY_CONDITIONS[state.achievedVictory!];
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg text-center space-y-6">
        <Trophy className="w-16 h-16 text-primary mx-auto" />
        <div className="text-4xl">{vc.icon}</div>
        <h1 className="font-mono text-lg text-primary">{vc.name}</h1>
        <p className="font-mono text-sm text-foreground/80">{vc.description}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onDebrief} className="sim-rpg-button px-6 py-2 text-sm">View Debrief</button>
          <button onClick={onRestart} className="sim-rpg-button px-6 py-2 text-sm opacity-70"><RotateCcw className="w-4 h-4" /> Play Again</button>
        </div>
      </div>
    </div>
  );
};

// Debrief
const DebriefScreen = ({ state, onRestart }: { state: OpenFutureGameState; onRestart: () => void }) => (
  <div className="min-h-screen bg-background relative">
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8"><h1 className="font-mono text-lg text-primary mb-2">Five-Year Assessment</h1></div>
      <div className="sim-pixel-box p-4 mb-6">
        <h3 className="font-mono text-xs text-foreground mb-3">Key Decisions</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {state.decisions.slice(0, 20).map((d, i) => (
            <div key={i} className="flex items-start gap-3 text-xs font-mono"><span className="text-primary shrink-0">Q{d.quarter}</span><span className="text-muted-foreground">{d.name}:</span><span className="text-foreground">{d.choiceLabel}</span></div>
          ))}
        </div>
      </div>
      <div className="text-center"><button onClick={onRestart} className="sim-rpg-button px-6 py-2 text-sm flex items-center gap-2 mx-auto"><RotateCcw className="w-4 h-4" /> Play Again</button></div>
    </div>
  </div>
);

// Main Game Component
interface OpenFutureGameProps { onRestart: () => void; }

export const OpenFutureGame = ({ onRestart }: OpenFutureGameProps) => {
  const { state, actions, availableStrategicActions } = useOpenFutureGame();

  if (state.phase === "opening") return <OpeningScreen onStart={actions.startGame} />;
  if (state.phase === "gameover") return <GameOverScreen state={state} onRestart={() => { actions.restart(); onRestart(); }} />;
  if (state.phase === "victory") return <VictoryScreen state={state} onDebrief={actions.viewDebrief} onRestart={() => { actions.restart(); onRestart(); }} />;
  if (state.phase === "debrief") return <DebriefScreen state={state} onRestart={() => { actions.restart(); onRestart(); }} />;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 sim-scanlines opacity-10 pointer-events-none" />
      <ResourceBar state={state} />
      <div className="container mx-auto px-4 py-4">
        {state.phase === "briefing" && <BriefingPhase state={state} onStartTurn={actions.startTurn} />}
        {state.phase === "event" && <EventPhase state={state} onResolveEvent={actions.resolveEvent} onFinishEvents={actions.finishEvents} />}
        {state.phase === "strategy" && <StrategyPhase state={state} availableActions={availableStrategicActions} onSelectActions={actions.selectActions} onInvestTech={actions.investTech} onHire={actions.hire} onExecute={actions.executeTurn} />}
        {state.phase === "execution" && <ExecutionPhase results={state.executionResults} onContinue={actions.finishReflection} />}
        {state.phase === "reflection" && <ExecutionPhase results={[]} onContinue={actions.finishReflection} />}
      </div>
    </div>
  );
};
