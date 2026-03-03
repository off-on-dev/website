export interface ActionType {
  id: string;
  name: string;
  icon: "attack" | "special" | "defend" | "strategy";
  damage: number;
  animation: "slash" | "beam" | "shield" | "boost";
  description: string;
}

interface BattleActionProps {
  action: ActionType;
  onClick: () => void;
  disabled?: boolean;
}

const ActionIcon = ({ type }: { type: ActionType["icon"] }) => {
  switch (type) {
    case "attack":
      return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M4 4h4v4H4V4zm0 8h4v4H4v-4zm8-8h4v4h-4V4zm4 4h4v4h-4V8zm-4 4h4v4h-4v-4zm4 4h4v4h-4v-4zm-8 0h4v4H8v-4z" /></svg>;
    case "special":
      return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" /></svg>;
    case "defend":
      return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2L4 6v6c0 5.5 3.4 10.3 8 12 4.6-1.7 8-6.5 8-12V6l-8-4zm0 4h4v4h-4V6zm-4 4h4v4H8v-4zm0 4h4v4H8v-4z" /></svg>;
    case "strategy":
      return <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M4 4h16v4H4V4zm0 8h8v8H4v-8zm12 0h4v4h-4v-4zm0 6h4v2h-4v-2z" /></svg>;
  }
};

const colorClasses = {
  attack: "border-destructive text-destructive hover:bg-destructive/20",
  special: "border-primary text-primary hover:bg-primary/20",
  defend: "border-accent text-accent hover:bg-accent/20",
  strategy: "border-muted-foreground text-muted-foreground hover:bg-muted/20",
};

export const BattleAction = ({ action, onClick, disabled }: BattleActionProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative group sim-pixel-border p-3 bg-background/80 backdrop-blur-sm transition-all duration-200 ${colorClasses[action.icon]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"} flex flex-col items-center gap-1`}
  >
    <ActionIcon type={action.icon} />
    <span className="font-mono text-[10px] tracking-wider">{action.name}</span>
    <span className="font-mono text-[8px] opacity-70">DMG: {action.damage}</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono text-[10px] text-muted-foreground">
      {action.description}
    </div>
  </button>
);
