import { useState } from "react";

export interface StrategicOption {
  id: string;
  text: string;
  shortLabel: string;
}

export interface StrategicTurnData {
  turnNumber: number;
  year: number;
  narrative: string;
  options: StrategicOption[];
}

interface StrategicTurnProps {
  turn: StrategicTurnData;
  onSelectOption: (optionId: string) => void;
  previousFeedback?: string;
}

export const StrategicTurn = ({ turn, onSelectOption, previousFeedback }: StrategicTurnProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSelect = (optionId: string) => { setSelectedOption(optionId); setIsConfirming(true); };
  const handleConfirm = () => { if (selectedOption) onSelectOption(selectedOption); };
  const handleCancel = () => { setSelectedOption(null); setIsConfirming(false); };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <span className="font-mono text-xs text-muted-foreground">TURN {turn.turnNumber} OF 3</span>
        <h2 className="font-mono text-lg text-primary mt-2">YEAR {turn.year}</h2>
      </div>

      {previousFeedback && (
        <div className="sim-pixel-box mb-8 bg-muted/30">
          <p className="font-mono text-sm text-muted-foreground italic">{previousFeedback}</p>
        </div>
      )}

      <div className="sim-pixel-box mb-8">
        <p className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-line">{turn.narrative}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-xs text-muted-foreground text-center mb-4">WHAT DO YOU DECIDE?</h3>
        {turn.options.map((option, index) => (
          <button key={option.id} onClick={() => handleSelect(option.id)} disabled={isConfirming}
            className={`w-full text-left sim-pixel-box p-5 transition-all ${selectedOption === option.id ? "border-primary bg-primary/10" : isConfirming ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-primary/5"}`}>
            <div className="flex gap-4">
              <span className="font-mono text-sm text-primary shrink-0">{String.fromCharCode(65 + index)}.</span>
              <div>
                <span className="font-mono text-xs text-muted-foreground block mb-1">{option.shortLabel}</span>
                <p className="font-mono text-sm text-foreground">{option.text}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isConfirming && (
        <div className="mt-8 sim-pixel-box bg-card border-primary/50">
          <p className="font-mono text-sm text-muted-foreground text-center mb-4">This decision is irreversible. Are you sure?</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleCancel} className="px-6 py-2 font-mono text-xs text-muted-foreground border border-border rounded hover:border-muted-foreground transition-colors">RECONSIDER</button>
            <button onClick={handleConfirm} className="sim-rpg-button">CONFIRM DECISION</button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="font-mono text-xs text-muted-foreground opacity-60">Each choice strengthens one dimension while weakening another</p>
      </div>
    </div>
  );
};
