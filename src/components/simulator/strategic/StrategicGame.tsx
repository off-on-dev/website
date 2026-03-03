import { useState, useCallback } from "react";
import { StrategicTurn, StrategicTurnData } from "./StrategicTurn";
import { StrategicSummary } from "./StrategicSummary";
import { StrategicIntro } from "./StrategicIntro";
import {
  StrategicDecision, HiddenDynamics, INITIAL_DYNAMICS, OPTION_EFFECTS, POSTURE_OUTCOMES, LEARNING_OUTCOMES, STARTING_CONTEXT, getTurn, getFeedback, getOptionLabel,
} from "@/data/simulator/strategicScenarios";

interface StrategicGameProps { onRestart: () => void; }

type GamePhase = "intro" | "playing" | "summary";

interface GameState {
  phase: GamePhase;
  currentTurn: number;
  decisions: StrategicDecision[];
  dynamics: HiddenDynamics;
  previousFeedback: string;
}

const generatePosture = (dynamics: HiddenDynamics, _decisions: StrategicDecision[]) => {
  const { developerTrust, executiveConfidence, technologyDependency, longTermOptionality, legalExposure } = dynamics;
  if (technologyDependency > 15 && longTermOptionality < 0) return POSTURE_OUTCOMES.compliantDependent;
  if (developerTrust > 15 && legalExposure > 10) return POSTURE_OUTCOMES.trustedExposed;
  if (longTermOptionality > 10 && executiveConfidence < 10) return POSTURE_OUTCOMES.sovereignSlow;
  if (executiveConfidence > 15 && developerTrust < 0) return POSTURE_OUTCOMES.highControlLowFlex;
  if (longTermOptionality > 20) return POSTURE_OUTCOMES.strategicOptional;
  return { title: "Functional but Unremarkable", description: "Your organization has a functional open source practice. It is neither a strategic asset nor a significant liability." };
};

const generateJourneyExplanation = (decisions: StrategicDecision[]): string => {
  let explanation = "";
  const first = decisions[0]; const second = decisions[1]; const third = decisions[2];
  if (first?.optionId === "1a") explanation = "You began by positioning the OSPO as a compliance function.";
  else if (first?.optionId === "1b") explanation = "You began by positioning the OSPO as a strategic advisor.";
  else if (first?.optionId === "1c") explanation = "You began by focusing on developer enablement.";
  if (second) {
    if (second.optionId.includes("2a")) explanation += " When the AI decision arrived, you chose caution over speed.";
    else if (second.optionId.includes("2b")) explanation += " When the AI decision arrived, you found a middle path.";
    else if (second.optionId.includes("2c")) explanation += " When the AI decision arrived, you stepped back.";
  }
  if (third) {
    if (third.optionId === "3a") explanation += " When regulation arrived, you recommended minimal changes.";
    else if (third.optionId === "3b") explanation += " When regulation arrived, you recommended a gradual shift.";
    else if (third.optionId === "3c") explanation += " When regulation arrived, you pushed for meaningful change.";
  }
  return explanation;
};

const generateConstraintsReflection = (dynamics: HiddenDynamics): string => {
  const reflections: string[] = [];
  if (dynamics.technologyDependency > 20) reflections.push("Dependencies on external providers have deepened.");
  if (dynamics.developerTrust < -10) reflections.push("Developer trust in the OSPO has eroded.");
  if (dynamics.legalExposure > 15) reflections.push("Compliance gaps remain.");
  if (dynamics.longTermOptionality < -15) reflections.push("Strategic flexibility has narrowed.");
  if (dynamics.longTermOptionality > 20) reflections.push("You have preserved meaningful optionality.");
  if (reflections.length === 0) reflections.push("Your organization retains reasonable flexibility.");
  return reflections.join(" ");
};

export const StrategicGame = ({ onRestart }: StrategicGameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "intro", currentTurn: 1, decisions: [], dynamics: { ...INITIAL_DYNAMICS }, previousFeedback: "",
  });

  const currentTurnData: StrategicTurnData = getTurn(gameState.currentTurn, gameState.decisions);

  const handleStartGame = useCallback(() => setGameState(prev => ({ ...prev, phase: "playing" })), []);

  const handleSelectOption = useCallback((optionId: string) => {
    const effects = OPTION_EFFECTS[optionId] || {};
    const feedback = getFeedback(optionId);
    const shortLabel = getOptionLabel(optionId, currentTurnData);

    setGameState(prev => {
      const newDynamics = { ...prev.dynamics };
      Object.entries(effects).forEach(([key, value]) => {
        const dk = key as keyof HiddenDynamics;
        newDynamics[dk] = (newDynamics[dk] || 0) + (value || 0);
      });
      const newDecisions = [...prev.decisions, { turnNumber: prev.currentTurn, optionId, shortLabel }];
      if (prev.currentTurn >= 3) return { ...prev, phase: "summary" as GamePhase, decisions: newDecisions, dynamics: newDynamics, previousFeedback: feedback };
      return { ...prev, currentTurn: prev.currentTurn + 1, decisions: newDecisions, dynamics: newDynamics, previousFeedback: feedback };
    });
  }, [currentTurnData]);

  if (gameState.phase === "intro") {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="fixed inset-0 sim-scanlines opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <StrategicIntro context={STARTING_CONTEXT} onStart={handleStartGame} />
        </div>
      </div>
    );
  }

  if (gameState.phase === "summary") {
    const posture = generatePosture(gameState.dynamics, gameState.decisions);
    return (
      <div className="min-h-screen bg-background relative">
        <div className="fixed inset-0 sim-scanlines opacity-10 pointer-events-none" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <StrategicSummary
            postureTitle={posture.title} postureSummary={posture.description}
            journeyExplanation={generateJourneyExplanation(gameState.decisions)}
            constraintsReflection={generateConstraintsReflection(gameState.dynamics)}
            decisions={gameState.decisions.map(d => ({ year: 2024 + d.turnNumber, optionChosen: d.optionId, shortLabel: d.shortLabel }))}
            learningOutcomes={LEARNING_OUTCOMES} onRestart={onRestart}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 sim-scanlines opacity-10 pointer-events-none" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-8">
          <h1 className="font-mono text-sm text-primary">What Is the OSPO Actually For?</h1>
          <p className="font-mono text-xs text-muted-foreground mt-2">A Strategic Simulation</p>
        </header>
        <StrategicTurn turn={currentTurnData} onSelectOption={handleSelectOption} previousFeedback={gameState.previousFeedback || undefined} />
      </div>
    </div>
  );
};
