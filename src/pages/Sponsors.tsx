import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const currentSponsors = [
  { name: "Dynatrace", role: "Founding Sponsor", url: "https://dynatrace.com" },
];

const Sponsors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Sponsors</span>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Sponsorship and Independence
          </h1>
          <p className="mt-4 text-[hsl(var(--text-secondary))] leading-relaxed text-lg">
            Sponsors provide financial support and participate as community members, but do not control technical direction, content priorities, or governance. This community belongs to its members.
          </p>
        </div>

        {/* Founding Sponsor */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">Founding Sponsor</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            Dynatrace is the founding sponsor of Open Ecosystem. There is Dynatrace-related content in one dedicated category which you can choose to join, but the rest of the content is vendor-neutral and community-driven.
          </p>
          <div className="flex flex-wrap gap-5">
            {currentSponsors.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.role}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Independence note */}
        <section className="mb-16 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">How We Maintain Trust</h2>
          <ul className="space-y-3">
            {[
              "Sponsors do not control technical direction, content priorities, or community governance.",
              "Promotional content is not permitted. Technical product mentions are welcome only when neutral and reproducible.",
              "Our moderation policies and decision-making processes are documented and accessible.",
              "Community input directly shapes how we evolve.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact CTA */}
        <section className="rounded-2xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-12 text-center relative overflow-hidden">
          <div className="cta-glow absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-foreground">Interested in supporting?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We welcome additional sponsors who share our mission and values. Reach out and let's talk about how you can get involved.
            </p>
            <a
              href="mailto:sponsors@offon.dev?subject=Sponsorship Inquiry"
              className="mt-8 btn-primary"
            >
              Get in touch →
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Sponsors;
