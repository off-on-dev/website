import { CountUp } from "./CountUp";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stats = [
  { value: 265, label: "Members" },
  { value: 10, label: "Admins" },
  { value: 6, label: "Moderators" },
  { value: 6, suffix: " mo", label: "Community Age" },
];

type StatsBarProps = {
  variant?: "default" | "accent";
}

export const StatsBar = ({ variant = "default" }: StatsBarProps): JSX.Element => {
  const { ref, isVisible } = useScrollAnimation();
  const isAccent = variant === "accent";

  return (
    <section
      ref={ref}
      className={isAccent ? "bg-primary py-12" : "border-y border-[hsl(var(--surface-border))] py-12"}
      aria-label="Community statistics"
    >
      <div className={`mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`text-center ${i > 0 ? `md:border-l ${isAccent ? 'md:border-background/30' : 'md:border-[hsl(var(--surface-border))]'}` : ''}`}
          >
            <div className={`font-mono text-3xl font-semibold ${isAccent ? 'text-background' : 'text-foreground'}`}>
              <CountUp end={stat.value} suffix={stat.suffix} />
            </div>
            <div className={`mt-1 text-sm ${isAccent ? 'text-background/80' : 'text-muted-foreground'}`}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
