import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { COMMUNITY_URL, BRAND_NAME } from "@/data/constants";

export const BottomCTA = (): JSX.Element => {
  const { ref, animationClass } = useScrollAnimation();

  return (
    <section ref={ref} className="bg-primary py-16 px-6 md:px-16">
      <div className={`${animationClass} mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center`}>
          {/* Left - headline */}
          <h2 aria-label="Start curious. Break things. Learn together. Glow brighter." className="animate-fade-up text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background">
            <span className="block" aria-hidden="true">Start curious.</span>
            <span className="block" aria-hidden="true">Break things.</span>
            <span className="block" aria-hidden="true">Learn together.</span>
            <span className="block" aria-hidden="true">Glow brighter.</span>
          </h2>

          {/* Right - copy + buttons */}
          <div className="animate-fade-up-delay-1 flex flex-col gap-4">
            <p className="font-sans text-base leading-relaxed text-background/90">
              Some species of fireflies synchronize their flashing. Thousands of individuals, each emitting their own signal, collectively producing something far more powerful than any single light source could output.
            </p>
            <p className="font-sans text-base leading-relaxed text-background/90">
              That's {BRAND_NAME}.{" "}
              <strong className="font-medium text-background">
                You bring your questions, your fixes, your ideas.
              </strong>{" "}
              We bring the challenges, the tooling, and the engineers who care about the same problems you do.
            </p>
            <p className="font-sans text-base leading-relaxed text-background/90">
              Every spark starts with one person. Together, we illuminate the whole open source ecosystem.
            </p>
            <p className="font-sans text-base font-medium text-background">
              Always on. Always open. Always learning.
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
              className="btn-inverse"
              >
                Join the community <ArrowRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
              <a
                href="https://github.com/dynatrace-oss/open-ecosystem-challenges"
                target="_blank"
                rel="noopener noreferrer"
              className="btn-ghost-inverse"
              >
                GitHub <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>
      </div>
    </section>
  );
};
