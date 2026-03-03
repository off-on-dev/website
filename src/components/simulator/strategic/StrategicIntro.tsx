interface StrategicIntroProps {
  context: string;
  onStart: () => void;
}

export const StrategicIntro = ({ context, onStart }: StrategicIntroProps) => (
  <div className="max-w-3xl mx-auto">
    <div className="text-center mb-10">
      <span className="font-mono text-xs text-muted-foreground">STRATEGIC SIMULATION</span>
      <h1 className="font-mono text-xl text-primary mt-2">What Is the OSPO Actually For?</h1>
      <p className="font-mono text-sm text-muted-foreground mt-4">A turn-based simulation of long-term strategic decision making</p>
    </div>

    <div className="sim-pixel-box mb-8">
      <h2 className="font-mono text-xs text-muted-foreground mb-4">YOUR ROLE</h2>
      <div className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-line">{context}</div>
    </div>

    <div className="sim-pixel-box mb-8 bg-muted/20">
      <h2 className="font-mono text-xs text-muted-foreground mb-4">HOW THIS WORKS</h2>
      <ul className="space-y-3 font-mono text-sm text-muted-foreground">
        <li className="flex gap-3"><span className="text-primary shrink-0">1.</span><span>You will make three decisions, one per year</span></li>
        <li className="flex gap-3"><span className="text-primary shrink-0">2.</span><span>Each decision is irreversible and shapes future options</span></li>
        <li className="flex gap-3"><span className="text-primary shrink-0">3.</span><span>There are no scores or points, only trade-offs</span></li>
        <li className="flex gap-3"><span className="text-primary shrink-0">4.</span><span>Consequences are delayed and cumulative</span></li>
        <li className="flex gap-3"><span className="text-primary shrink-0">5.</span><span>There is no winning outcome, only different postures</span></li>
      </ul>
    </div>

    <div className="text-center">
      <button onClick={onStart} className="sim-rpg-button text-lg px-8 py-4">BEGIN SIMULATION</button>
      <p className="font-mono text-xs text-muted-foreground mt-4 opacity-60">Each turn represents one year of decisions</p>
    </div>
  </div>
);
