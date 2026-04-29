import type { JSX } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { COMMUNITY_URL, BRAND_NAME } from "@/data/constants";

export const BottomCTA = (): JSX.Element => {
  return (
    <section className="bg-primary py-16 px-6 md:px-16 relative overflow-hidden">
      <img
        src={`${import.meta.env.BASE_URL}offon_mascot_2_transparent.png`}
        alt=""
        aria-hidden="true"
        width={180}
        height={180}
        loading="lazy"
        className="pointer-events-none hidden xl:block absolute top-0 right-0 w-44 translate-x-4 -translate-y-3 drop-shadow-[0_0_28px_rgba(255,255,255,0.55)]"
      />
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - headline */}
          <div className="animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-foreground">
              <span className="block">Start Curious.</span>
              <span className="block">Break Things.</span>
              <span className="block">Learn Together.</span>
              <span className="block">Glow Brighter.</span>
            </h2>
          </div>

          {/* Right - copy + buttons */}
          <div className="animate-fade-up-delay-1 flex flex-col gap-4">
            <p className="font-sans text-base leading-relaxed text-background/90">
              Some species of fireflies synchronize their flashing. Thousands of individuals, each emitting their own signal, collectively producing something far more powerful than any single light source could alone.
            </p>
            <p className="font-sans text-base leading-relaxed text-background/90">
              That's {BRAND_NAME}.{" "}
              <strong className="font-medium text-primary-foreground">
                You bring your questions, your fixes, your ideas.
              </strong>{" "}
              We bring the challenges, the tooling, and the practitioners who care about the same problems you do.
            </p>
            <p className="font-sans text-base leading-relaxed text-background/90">
              Every spark starts with one person. Together, we illuminate the whole open source ecosystem.
            </p>
            <p className="font-sans text-base font-medium text-background/90">
              Always On. Always Open. Always Learning.
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
              className="btn-inverse"
              >
                Join the Community <ArrowRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
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
