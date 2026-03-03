import { useNavigate } from "react-router-dom";
import { StrategicGame } from "@/components/simulator/strategic/StrategicGame";
import { ArrowLeft } from "lucide-react";

const SimulatorStrategic = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-mono transition-colors bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded border border-border">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <StrategicGame onRestart={() => {}} />
    </div>
  );
};

export default SimulatorStrategic;
