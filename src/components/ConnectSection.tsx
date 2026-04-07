import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const items = [
  {
    icon: "👋",
    title: "Introduce yourself",
    desc: "New here? Drop a post and say hello. Tell us what you're working on, what you're curious about, and where you're from. This is how connections start.",
    cta: "Say hello →",
    href: "https://community.offon.dev",
  },
  {
    icon: "📅",
    title: "Events & meetups",
    desc: "Find upcoming events, add local meetups to the community calendar, and connect with members in your city or timezone. Open source is better in person.",
    cta: "See upcoming events →",
    href: "https://community.offon.dev",
  },
];

export const ConnectSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
                Connect
              </span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Meet the people behind the code
            </h2>
            <p className="animate-fade-up-delay-1 mb-12 max-w-xl text-[hsl(var(--text-secondary))] leading-relaxed">
              Open source communities thrive when people know each other. Find events near you, say hello, and build relationships that last.
            </p>
            <div className="animate-fade-up-delay-2 grid gap-6 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="card-glow flex flex-col rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8"
                >
                  <span className="text-3xl mb-4">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{item.desc}</p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 text-sm font-medium text-primary hover:underline"
                  >
                    {item.cta}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
