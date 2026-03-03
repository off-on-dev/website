import { useEffect, useState } from "react";

interface BattleSpriteProps {
  type: "player" | "opponent";
  variant: "standard" | "speed" | "boss";
  isAttacking?: boolean;
  isDamaged?: boolean;
  health: number;
  maxHealth: number;
  name: string;
  isDefending?: boolean;
}

const PixelPenguin = () => (
  <svg width={64} height={64} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
    <rect x="10" y="8" width="12" height="16" fill="hsl(var(--foreground))" />
    <rect x="8" y="10" width="2" height="12" fill="hsl(var(--foreground))" />
    <rect x="22" y="10" width="2" height="12" fill="hsl(var(--foreground))" />
    <rect x="12" y="12" width="8" height="10" fill="hsl(0 0% 95%)" />
    <rect x="11" y="14" width="10" height="6" fill="hsl(0 0% 95%)" />
    <rect x="11" y="4" width="10" height="6" fill="hsl(var(--foreground))" />
    <rect x="10" y="5" width="12" height="4" fill="hsl(var(--foreground))" />
    <rect x="12" y="5" width="3" height="3" fill="white" />
    <rect x="17" y="5" width="3" height="3" fill="white" />
    <rect x="13" y="6" width="2" height="2" fill="black" />
    <rect x="18" y="6" width="2" height="2" fill="black" />
    <rect x="14" y="8" width="4" height="2" fill="hsl(30 100% 50%)" />
    <rect x="15" y="10" width="2" height="1" fill="hsl(30 100% 50%)" />
    <rect x="10" y="24" width="4" height="2" fill="hsl(30 100% 50%)" />
    <rect x="18" y="24" width="4" height="2" fill="hsl(30 100% 50%)" />
    <rect x="6" y="12" width="3" height="8" fill="hsl(var(--foreground))" />
    <rect x="23" y="12" width="3" height="8" fill="hsl(var(--foreground))" />
  </svg>
);

const PixelMysteryBox = ({ size = "normal" }: { size?: "normal" | "boss" }) => {
  const scale = size === "boss" ? 2 : 1;
  return (
    <svg width={64 * scale} height={64 * scale} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="8" width="24" height="20" fill="hsl(240 30% 15%)" />
      <rect x="6" y="10" width="20" height="16" fill="hsl(240 30% 20%)" />
      <rect x="4" y="8" width="24" height="2" fill="hsl(240 20% 30%)" />
      <rect x="14" y="12" width="4" height="2" fill="hsl(var(--primary))" />
      <rect x="17" y="13" width="2" height="3" fill="hsl(var(--primary))" />
      <rect x="14" y="16" width="4" height="2" fill="hsl(var(--primary))" />
      <rect x="13" y="17" width="2" height="2" fill="hsl(var(--primary))" />
      <rect x="14" y="22" width="2" height="2" fill="hsl(var(--primary))" />
    </svg>
  );
};

export const BattleSprite = ({ type, variant, isAttacking, isDamaged, health, maxHealth, name, isDefending = false }: BattleSpriteProps) => {
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (isAttacking) {
      setAnimClass(type === "player" ? "sim-animate-attack-right" : "sim-animate-attack-left");
      const timer = setTimeout(() => setAnimClass(""), 600);
      return () => clearTimeout(timer);
    }
    if (isDamaged) {
      setAnimClass("sim-animate-damage");
      const timer = setTimeout(() => setAnimClass(""), 500);
      return () => clearTimeout(timer);
    }
  }, [isAttacking, isDamaged, type]);

  const healthPercent = (health / maxHealth) * 100;
  const healthColor = healthPercent > 50 ? "bg-primary" : healthPercent > 25 ? "bg-yellow-500" : "bg-destructive";

  return (
    <div className={`flex flex-col items-center ${animClass}`}>
      <div className="w-full mb-3 px-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[8px] text-foreground">{name}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{health}/{maxHealth}</span>
        </div>
        <div className="h-3 bg-muted sim-pixel-border overflow-hidden">
          <div className={`h-full ${healthColor} transition-all duration-500`} style={{ width: `${healthPercent}%` }} />
        </div>
      </div>
      <div className={`transform hover:scale-105 transition-transform ${isDefending ? 'ring-2 ring-primary/50' : ''}`}>
        <div className="relative">
          {type === "player" ? <PixelPenguin /> : <PixelMysteryBox size={variant === "boss" ? "boss" : "normal"} />}
          <div className={`absolute inset-0 ${type === "player" ? "bg-primary/20" : "bg-destructive/20"} blur-xl rounded-full -z-10`} />
        </div>
      </div>
    </div>
  );
};
