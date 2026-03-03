import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Decision { year: number; optionChosen: string; shortLabel: string; }
interface LearningOutcome { observation: string; }

interface StrategicSummaryProps {
  postureTitle: string;
  postureSummary: string;
  journeyExplanation: string;
  constraintsReflection: string;
  decisions: Decision[];
  learningOutcomes: LearningOutcome[];
  onRestart: () => void;
}

export const StrategicSummary = ({ postureTitle, postureSummary, journeyExplanation, constraintsReflection, decisions, learningOutcomes, onRestart }: StrategicSummaryProps) => {
  const [showLearnings, setShowLearnings] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="font-mono text-xs text-muted-foreground">END OF SIMULATION</span>
        <h2 className="font-mono text-lg text-primary mt-2">THREE YEARS LATER</h2>
      </div>

      <div className="sim-pixel-box mb-8">
        <h3 className="font-mono text-xs text-muted-foreground mb-2">YOUR STRATEGIC POSTURE</h3>
        <h4 className="font-mono text-sm text-primary mb-4">{postureTitle}</h4>
        <p className="font-mono text-sm text-foreground leading-relaxed">{postureSummary}</p>
      </div>

      <div className="sim-pixel-box mb-8 bg-muted/20">
        <h3 className="font-mono text-xs text-muted-foreground mb-4">HOW YOU ARRIVED HERE</h3>
        <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">{journeyExplanation}</p>
        <div className="space-y-3 border-l-2 border-primary/30 pl-4">
          {decisions.map((decision, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary/50" />
              <span className="font-mono text-xs text-primary">Year {decision.year}</span>
              <p className="font-mono text-xs text-muted-foreground mt-1">{decision.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sim-pixel-box mb-8">
        <h3 className="font-mono text-xs text-muted-foreground mb-4">WHAT CAN AND CANNOT CHANGE</h3>
        <p className="font-mono text-sm text-foreground leading-relaxed">{constraintsReflection}</p>
      </div>

      <div className="sim-pixel-box mb-8">
        {!showLearnings ? (
          <button onClick={() => setShowLearnings(true)} className="w-full flex items-center justify-center gap-2 py-4 font-mono text-xs text-primary hover:text-primary/80 transition-colors">
            REVEAL OBSERVATIONS <ChevronDown className="w-4 h-4" />
          </button>
        ) : (
          <div className="animate-fade-up">
            <h3 className="font-mono text-xs text-muted-foreground mb-6 text-center">OBSERVATIONS FROM THIS EXPERIENCE</h3>
            <div className="space-y-4">
              {learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className="font-mono text-xs text-primary shrink-0 mt-1">{index + 1}.</span>
                  <p className="font-mono text-sm text-muted-foreground">{outcome.observation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button onClick={onRestart} className="sim-rpg-button">START NEW SIMULATION</button>
        <p className="font-mono text-xs text-muted-foreground mt-4 opacity-60">Each playthrough reveals different strategic trade-offs</p>
      </div>
    </div>
  );
};
