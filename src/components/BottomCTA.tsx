import type { JSX } from "react";
import { ExternalLink } from "lucide-react";
import { BRAND_NAME, BRAND_SECONDARY_LINE, COMMUNITY_URL } from "@/data/constants";

export const BottomCTA = (): JSX.Element => {
  return (
    <section aria-labelledby="bottom-cta-heading" className="bg-primary py-16 px-6 md:px-16 relative overflow-hidden">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-12 lg:gap-16 items-center">
          {/* Left - headline */}
          <div>
            <h2 id="bottom-cta-heading" className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-foreground">
              <span className="block">Start Curious.</span>
              <span className="block">Break Things.</span>
              <span className="block">Learn Together.</span>
              <span className="block">Glow Brighter.</span>
            </h2>
          </div>

          {/* Right - copy + buttons */}
          <div className="flex flex-col gap-4">
            <p className="font-sans text-base leading-relaxed text-background/90">
              <strong className="font-medium text-primary-foreground">
                You bring your questions, your fixes, your ideas.
              </strong>{" "}
              We bring the challenges, the tooling, and the practitioners who care about the same problems you do.
            </p>
            <p className="font-sans text-base leading-relaxed text-background/90">
              Every spark starts with one person. Like Nyx, our firefly, together we brighten the whole open source ecosystem.
            </p>
            <p className="font-sans text-base font-medium text-background/90">
              That's {BRAND_NAME}. {BRAND_SECONDARY_LINE}
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
              className="btn-inverse"
              >
                Join the Community <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
              <a
                href="https://github.com/off-on-dev/open-source-challenges"
                target="_blank"
                rel="noopener noreferrer"
              className="btn-ghost-inverse"
              >
                View Challenges on GitHub <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>

          {/* Nyx mascot - third column, visible on lg+ only */}
          <img
            src={`${import.meta.env.BASE_URL}nyx.webp`}
            alt=""
            aria-hidden="true"
            width={240}
            height={240}
            loading="lazy"
            decoding="async"
            className="hidden lg:block w-[240px] h-[240px] self-start"
          />
      </div>
    </section>
  );
};
