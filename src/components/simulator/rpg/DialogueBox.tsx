import { useEffect, useState } from "react";

interface DialogueBoxProps {
  text: string;
  speaker?: string;
  speed?: number;
}

export const DialogueBox = ({ text, speaker, speed = 30 }: DialogueBoxProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <div className="sim-dialogue-box">
      {speaker && (
        <div className="font-mono text-[10px] text-primary mb-1">{speaker}:</div>
      )}
      <p className="font-mono text-[10px] text-foreground leading-relaxed min-h-[2.5rem]">
        {displayedText}
        {!isComplete && <span className="inline-block w-2 h-3 bg-primary ml-1 animate-pulse" />}
      </p>
      {isComplete && (
        <div className="text-right mt-1">
          <span className="font-mono text-[8px] text-muted-foreground animate-pulse">▼</span>
        </div>
      )}
    </div>
  );
};
