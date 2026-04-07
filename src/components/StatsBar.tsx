import { CountUp } from "./CountUp";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stats = [
  { value: 265, label: "Members" },
  { value: 10, label: "Admins" },
  { value: 6, label: "Moderators" },
  { value: 6, suffix: " mo", label: "Community Age" },
];

export const StatsBar = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="border-y border-[hsl(var(--surface-border))] py-12">
      <div className={`mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
        {stats.map((stat, i) => (
          <div key={i} className={`text-center ${i > 0 ? 'md:border-l md:border-[hsl(var(--surface-border))]' : ''}`}>
            <div className="font-mono text-3xl font-semibold text-foreground">
              <CountUp end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
