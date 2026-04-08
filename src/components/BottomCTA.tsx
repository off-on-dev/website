import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const BottomCTA = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="bg-primary py-16 px-6 md:px-16">
      {isVisible && (
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — headline */}
          <h2 className="animate-fade-up text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background">
            Every firefly<br />
            glows{" "}
            <span className="ghost-word">alone.</span>
            <br />
            Together they<br />
            synchronize.
          </h2>

          {/* Right — copy + buttons */}
          <div className="animate-fade-up-delay-1 flex flex-col gap-4">
            <p className="font-mono text-sm leading-relaxed text-background/75">
              Some species of fireflies synchronize their flashing — thousands lighting up
              in perfect unison, creating something far more spectacular than any single light could.
            </p>
            <p className="font-mono text-sm leading-relaxed text-background/75">
              That's offon.{" "}
              <strong className="opacity-100 font-medium text-background">
                Everyone brings their own expertise, their own spark.
              </strong>{" "}
              The community is where those sparks synchronize into something that lights up the whole forest.
            </p>
            <p className="font-mono text-sm font-medium text-background">
              always on, always open.
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <a
                href="https://community.offon.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background text-primary font-bold text-sm px-5 py-2.5 rounded-md transition-all hover:brightness-110 active:scale-[0.97]"
              >
                Join the community →
              </a>
              <a
                href="https://github.com/dynatrace-oss/offon-challenges"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent text-background font-bold text-sm px-5 py-2.5 rounded-md border-2 border-background transition-all hover:bg-background/10 active:scale-[0.97]"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
