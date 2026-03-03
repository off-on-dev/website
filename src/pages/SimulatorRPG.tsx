import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SCENARIOS, Scenario } from "@/data/simulator/scenarios";
import { RPGBattleGame } from "@/components/simulator/rpg/RPGBattleGame";
import { ArrowLeft } from "lucide-react";

type Phase = "select" | "scenario" | "battle" | "result";

const SimulatorRPG = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("select");
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isWin, setIsWin] = useState(false);
  const [score, setScore] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  const selectScenario = (s: Scenario) => { setCurrentScenario(s); setPhase("scenario"); };

  const makeChoice = (isOpenSource: boolean) => {
    setIsWin(isOpenSource);
    setPhase("battle");
  };

  const handleBattleComplete = (playerWon: boolean) => {
    if (playerWon && currentScenario) {
      setScore(prev => prev + (currentScenario.difficulty === "hard" ? 300 : currentScenario.difficulty === "medium" ? 200 : 100));
      setCompletedScenarios(prev => [...prev, currentScenario.id]);
    }
    setPhase("result");
  };

  const gameType = currentScenario?.difficulty === "hard" ? "bossChallenge" as const : currentScenario?.difficulty === "medium" ? "speedDuel" as const : "standardBattle" as const;

  if (phase === "battle" && currentScenario) {
    return <RPGBattleGame gameType={gameType} isWin={isWin} onComplete={handleBattleComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 sim-scanlines opacity-10 pointer-events-none" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-mono mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </button>

        <header className="text-center mb-8">
          <h1 className="font-mono text-xl text-primary mb-2">RPG Battles</h1>
          <p className="font-mono text-sm text-muted-foreground">Turn-based combat for open source strategy</p>
          {score > 0 && <p className="font-mono text-xs text-primary mt-2">Score: {score}</p>}
        </header>

        {phase === "select" && (
          <div className="grid gap-4 max-w-2xl mx-auto">
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => selectScenario(s)} disabled={completedScenarios.includes(s.id)}
                className={`sim-pixel-box p-6 text-left transition-all ${completedScenarios.includes(s.id) ? "opacity-50" : "hover:border-primary/50 cursor-pointer"}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-mono text-sm text-foreground">{s.title}</h3>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${s.difficulty === "hard" ? "text-red-400 border-red-400/30" : s.difficulty === "medium" ? "text-yellow-400 border-yellow-400/30" : "text-primary border-primary/30"}`}>{s.difficulty.toUpperCase()}</span>
                </div>
                <p className="font-mono text-xs text-muted-foreground line-clamp-2">{s.context}</p>
                {completedScenarios.includes(s.id) && <span className="font-mono text-xs text-primary mt-2 block">✓ Completed</span>}
              </button>
            ))}
          </div>
        )}

        {phase === "scenario" && currentScenario && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="sim-pixel-box p-6">
              <h2 className="font-mono text-sm text-foreground mb-4">{currentScenario.title}</h2>
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">{currentScenario.context}</p>
            </div>
            <div className="space-y-3">
              {currentScenario.options.map(opt => (
                <button key={opt.label} onClick={() => makeChoice(opt.type === "open_source")}
                  className="w-full sim-pixel-box p-5 text-left hover:border-primary/50 transition-all">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border mb-2 inline-block ${opt.type === "open_source" ? "text-primary border-primary/30" : opt.type === "proprietary" ? "text-red-400 border-red-400/30" : "text-yellow-400 border-yellow-400/30"}`}>{opt.type.replace("_", " ").toUpperCase()}</span>
                  <p className="font-mono text-sm text-foreground">{opt.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <h2 className="font-mono text-lg text-primary">{isWin ? "Victory!" : "Defeat"}</h2>
            {currentScenario && (
              <div className="sim-pixel-box p-6 text-left">
                <h3 className="font-mono text-xs text-muted-foreground mb-2">STRATEGIST'S VERDICT</h3>
                <p className="font-mono text-sm text-foreground leading-relaxed">{currentScenario.strategistVerdict}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => setPhase("select")} className="sim-rpg-button">Next Scenario</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorRPG;
