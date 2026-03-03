import { useEffect, useState, useCallback, useMemo } from "react";
import { MiniGameType } from "@/data/simulator/scenarios";
import { BattleSprite } from "./BattleSprite";
import { DialogueBox } from "./DialogueBox";
import { BattleAction, ActionType } from "./BattleAction";

interface RPGBattleGameProps {
  gameType: MiniGameType;
  isWin: boolean;
  onComplete: (playerWon: boolean) => void;
}

interface BattleState {
  playerHealth: number;
  opponentHealth: number;
  playerMaxHealth: number;
  opponentMaxHealth: number;
  currentDialogue: string;
  dialogueSpeaker?: string;
  phase: "intro" | "player-turn" | "player-action" | "opponent-turn" | "victory" | "defeat";
  playerAttacking: boolean;
  opponentAttacking: boolean;
  playerDamaged: boolean;
  opponentDamaged: boolean;
  currentAnimation?: string;
  playerDefending: boolean;
  turnCount: number;
}

interface GameConfig {
  playerName: string;
  opponentName: string;
  playerMaxHealth: number;
  opponentMaxHealth: number;
  opponentDamage: number;
  actions: ActionType[];
  dialogues: { intro: string[]; opponentAttack: string[]; victory: string[]; defeat: string[] };
}

const GAME_CONFIGS: Record<MiniGameType, GameConfig> = {
  standardBattle: {
    playerName: "OSPO_KNIGHT", opponentName: "VENDOR_LOCK",
    playerMaxHealth: 60, opponentMaxHealth: 50, opponentDamage: 12,
    actions: [
      { id: "fork", name: "FORK", icon: "attack", damage: 30, animation: "slash", description: "Community fork attack" },
      { id: "audit", name: "AUDIT", icon: "special", damage: 40, animation: "beam", description: "Transparent audit beam" },
      { id: "shield", name: "SBOM", icon: "defend", damage: 15, animation: "shield", description: "SBOM shield defense" },
      { id: "contrib", name: "CONTRIB", icon: "strategy", damage: 25, animation: "boost", description: "Community contribution" },
    ],
    dialogues: {
      intro: ["A wild VENDOR_LOCK appears!", "OSPO_KNIGHT readies the open-source strategy..."],
      opponentAttack: ["VENDOR_LOCK uses LICENSING FEE!", "VENDOR_LOCK deploys PROPRIETARY TRAP!", "VENDOR_LOCK casts FEATURE CREEP!"],
      victory: ["VENDOR_LOCK is defeated!", "Open source prevails!"],
      defeat: ["The strategy falters...", "Vendor dependency increases..."],
    },
  },
  speedDuel: {
    playerName: "SPEED_STRATEGIST", opponentName: "TECH_DEBT",
    playerMaxHealth: 50, opponentMaxHealth: 40, opponentDamage: 10,
    actions: [
      { id: "refactor", name: "REFACTOR", icon: "attack", damage: 28, animation: "slash", description: "Quick refactor strike" },
      { id: "automate", name: "AUTOMATE", icon: "special", damage: 35, animation: "beam", description: "Automation script blast" },
      { id: "test", name: "TEST", icon: "defend", damage: 12, animation: "shield", description: "Test coverage shield" },
      { id: "cicd", name: "CI/CD", icon: "strategy", damage: 22, animation: "boost", description: "Pipeline deployment" },
    ],
    dialogues: {
      intro: ["SPEED DUEL initiated!", "TECH_DEBT charges forward!"],
      opponentAttack: ["LEGACY CODE STRIKE!", "DEPENDENCY CHAOS!", "DOCUMENTATION DEBT!"],
      victory: ["TECH_DEBT obliterated!", "Clean code achieved!"],
      defeat: ["Complexity wins...", "Technical debt accumulates..."],
    },
  },
  bossChallenge: {
    playerName: "EU_CHAMPION", opponentName: "MEGA_CORP_BOSS",
    playerMaxHealth: 80, opponentMaxHealth: 70, opponentDamage: 15,
    actions: [
      { id: "dma", name: "DMA", icon: "attack", damage: 40, animation: "slash", description: "Digital Markets Act" },
      { id: "gdpr", name: "GDPR", icon: "special", damage: 50, animation: "beam", description: "GDPR shield blast" },
      { id: "nis2", name: "NIS2", icon: "defend", damage: 20, animation: "shield", description: "NIS2 directive defense" },
      { id: "foss", name: "FOSS", icon: "strategy", damage: 35, animation: "boost", description: "FOSS community power" },
    ],
    dialogues: {
      intro: ["⚠️ BOSS BATTLE ⚠️", "MEGA_CORP_BOSS emerges from the cloud!", "\"Your open standards mean nothing here!\""],
      opponentAttack: ["MEGA_CORP uses MARKET DOMINANCE!", "MEGA_CORP deploys REGULATORY CAPTURE!", "MEGA_CORP casts LOBBYING BLITZ!"],
      victory: ["MEGA_CORP_BOSS is regulated!", "Digital sovereignty restored!"],
      defeat: ["The corporation prevails...", "Innovation stifled..."],
    },
  },
};

export const RPGBattleGame = ({ gameType, isWin, onComplete }: RPGBattleGameProps) => {
  const config = GAME_CONFIGS[gameType];

  const [state, setState] = useState<BattleState>({
    playerHealth: config.playerMaxHealth, opponentHealth: config.opponentMaxHealth,
    playerMaxHealth: config.playerMaxHealth, opponentMaxHealth: config.opponentMaxHealth,
    currentDialogue: "", phase: "intro",
    playerAttacking: false, opponentAttacking: false, playerDamaged: false, opponentDamaged: false,
    playerDefending: false, turnCount: 0,
  });
  const [introStep, setIntroStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (state.phase !== "intro") return;
    if (introStep < config.dialogues.intro.length) {
      setState(prev => ({ ...prev, currentDialogue: config.dialogues.intro[introStep], dialogueSpeaker: introStep === 0 ? "SYSTEM" : undefined }));
      const timer = setTimeout(() => setIntroStep(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      setState(prev => ({ ...prev, phase: "player-turn", currentDialogue: "Choose your action!" }));
    }
  }, [state.phase, introStep, config.dialogues.intro]);

  useEffect(() => {
    if (state.opponentHealth <= 0 && state.phase !== "victory") {
      setState(prev => ({ ...prev, phase: "victory", currentDialogue: config.dialogues.victory[0], dialogueSpeaker: "SYSTEM" }));
      setTimeout(() => setState(prev => ({ ...prev, currentDialogue: config.dialogues.victory[1] || config.dialogues.victory[0] })), 1200);
      setTimeout(() => onComplete(true), 2500);
    } else if (state.playerHealth <= 0 && state.phase !== "defeat") {
      setState(prev => ({ ...prev, phase: "defeat", currentDialogue: config.dialogues.defeat[0], dialogueSpeaker: "SYSTEM" }));
      setTimeout(() => setState(prev => ({ ...prev, currentDialogue: config.dialogues.defeat[1] || config.dialogues.defeat[0] })), 1200);
      setTimeout(() => onComplete(false), 2500);
    }
  }, [state.opponentHealth, state.playerHealth, state.phase, config.dialogues, onComplete]);

  const handleAction = useCallback((action: ActionType) => {
    if (isProcessing || state.phase !== "player-turn") return;
    setIsProcessing(true);
    const isDefending = action.icon === "defend";
    const baseDamage = isWin ? action.damage : Math.floor(action.damage * 0.8);

    setState(prev => ({ ...prev, phase: "player-action", playerAttacking: true, currentAnimation: action.animation, currentDialogue: `${config.playerName} uses ${action.name}!`, dialogueSpeaker: config.playerName, playerDefending: isDefending }));

    setTimeout(() => {
      setState(prev => ({ ...prev, playerAttacking: false, opponentDamaged: true, opponentHealth: Math.max(0, prev.opponentHealth - baseDamage) }));
      setTimeout(() => {
        setState(prev => ({ ...prev, opponentDamaged: false, currentAnimation: undefined }));
        if (state.opponentHealth - baseDamage <= 0) { setIsProcessing(false); return; }
        setTimeout(() => {
          const attackDialogue = config.dialogues.opponentAttack[state.turnCount % config.dialogues.opponentAttack.length];
          setState(prev => ({ ...prev, phase: "opponent-turn", opponentAttacking: true, currentDialogue: attackDialogue, dialogueSpeaker: config.opponentName }));
          setTimeout(() => {
            const opponentDamage = isWin ? Math.floor(config.opponentDamage * 0.7) : config.opponentDamage;
            setState(prev => ({ ...prev, opponentAttacking: false, playerDamaged: true, playerHealth: Math.max(0, prev.playerHealth - Math.floor(opponentDamage * (prev.playerDefending ? 0.5 : 1))) }));
            setTimeout(() => {
              setState(prev => ({ ...prev, playerDamaged: false, playerDefending: false, phase: "player-turn", turnCount: prev.turnCount + 1, currentDialogue: "Choose your action!", dialogueSpeaker: undefined }));
              setIsProcessing(false);
            }, 400);
          }, 500);
        }, 300);
      }, 300);
    }, 600);
  }, [isProcessing, state.phase, state.turnCount, state.opponentHealth, config, isWin]);

  const variant = gameType === "bossChallenge" ? "boss" : gameType === "speedDuel" ? "speed" : "standard";

  return (
    <div className="fixed inset-0 z-50 sim-battle-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 sim-scanlines opacity-20" />

      <div className="relative p-4 flex justify-between items-center border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="font-mono text-xs text-primary">
          {gameType === "bossChallenge" ? "⚠️ BOSS BATTLE" : gameType === "speedDuel" ? "⚡ SPEED DUEL" : "⚔️ STANDARD BATTLE"}
        </div>
        <div className="font-mono text-xs text-muted-foreground">TURN {state.turnCount + 1}</div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="flex items-center justify-center w-full max-w-4xl gap-4">
          <div className="flex-1 flex justify-center">
            <BattleSprite type="player" variant={variant} isAttacking={state.playerAttacking} isDamaged={state.playerDamaged} health={state.playerHealth} maxHealth={state.playerMaxHealth} name={config.playerName} isDefending={state.playerDefending} />
          </div>
          <div className="flex-shrink-0 flex flex-col items-center px-4 md:px-6">
            <div className="font-mono text-2xl md:text-3xl text-primary animate-pulse">VS</div>
            <div className="mt-2 w-12 md:w-16 h-1 bg-gradient-to-r from-primary via-muted to-primary opacity-60" />
          </div>
          <div className="flex-1 flex justify-center">
            <BattleSprite type="opponent" variant={variant} isAttacking={state.opponentAttacking} isDamaged={state.opponentDamaged} health={state.opponentHealth} maxHealth={state.opponentMaxHealth} name={config.opponentName} />
          </div>
        </div>
      </div>

      <div className="relative p-4 bg-background/30 backdrop-blur-sm">
        <DialogueBox text={state.currentDialogue} speaker={state.dialogueSpeaker} speed={gameType === "speedDuel" ? 40 : 60} />
      </div>

      {state.phase === "player-turn" && (
        <div className="relative p-4 bg-background/50 backdrop-blur-sm border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            {config.actions.map((action) => (
              <BattleAction key={action.id} action={action} onClick={() => handleAction(action)} disabled={isProcessing} />
            ))}
          </div>
        </div>
      )}

      <div className="absolute top-20 right-4">
        <div className={`font-mono text-[10px] px-3 py-1 sim-pixel-border ${state.phase === "victory" ? "text-primary border-primary" : state.phase === "defeat" ? "text-destructive border-destructive" : state.phase === "player-turn" ? "text-primary border-primary" : "text-muted-foreground border-muted"}`}>
          {state.phase === "player-turn" ? "YOUR TURN" : state.phase === "opponent-turn" ? "ENEMY TURN" : state.phase.toUpperCase().replace("-", " ")}
        </div>
      </div>
    </div>
  );
};
