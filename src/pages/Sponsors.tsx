import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Bronze",
    price: "$500",
    period: "/ month",
    color: "from-amber-700 to-amber-600",
    borderColor: "border-amber-700/30",
    features: [
      "Logo on the README",
      "Shoutout in monthly newsletter",
      "Listed on the sponsors page",
    ],
  },
  {
    name: "Silver",
    price: "$1,500",
    period: "/ month",
    color: "from-slate-400 to-slate-300",
    borderColor: "border-slate-400/30",
    featured: true,
    features: [
      "Everything in Bronze",
      "Logo on the landing page",
      "Co-branded challenge (1x/quarter)",
      "Priority support channel",
    ],
  },
  {
    name: "Gold",
    price: "$5,000",
    period: "/ month",
    color: "from-yellow-500 to-amber-400",
    borderColor: "border-yellow-500/30",
    features: [
      "Everything in Silver",
      "Dedicated co-branded adventure",
      "Featured in community spotlight",
      "Speaking slot at community events",
      "Custom challenge design consultation",
    ],
  },
];

const currentSponsors = [
  { name: "Dynatrace", tier: "Gold", url: "https://dynatrace.com" },
];

const whyReasons = [
  {
    icon: "🌍",
    title: "Reach a global community",
    desc: "Thousands of developers, DevOps engineers, and SREs use offon.devsharpen their open source and cloud-native skills.",
  },
  {
    icon: "🎯",
    title: "Targeted developer audience",
    desc: "Your brand in front of engineers who work with Kubernetes, CI/CD, observability, and infrastructure-as-code daily.",
  },
  {
    icon: "🤝",
    title: "Support open source education",
    desc: "Help make hands-on cloud-native education accessible to everyone, regardless of background or budget.",
  },
  {
    icon: "📈",
    title: "Measurable impact",
    desc: "Track engagement through challenge completions, community discussions, and GitHub activity tied to your sponsorship.",
  },
];

const Sponsors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Sponsors</span>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Power the next generation of learning
          </h1>
          <p className="mt-4 text-[hsl(var(--text-secondary))] leading-relaxed text-lg">
            Open offonoffonoffon.deveveryone. Sponsors make that possible by funding infrastructure, content creation, and community growth.
          </p>
        </div>

        {/* Why Sponsor */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Why sponsor?</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {whyReasons.map((r) => (
              <div key={r.title} className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                <span className="text-2xl">{r.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Sponsorship tiers</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border bg-[hsl(var(--surface))] p-6 ${tier.borderColor} ${tier.featured ? "ring-1 ring-primary/20" : ""}`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <div className={`inline-block bg-gradient-to-r ${tier.color} bg-clip-text text-transparent font-mono text-xs font-semibold uppercase tracking-widest`}>
                  {tier.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:sponsors@open-ecosysffon.devpoffon.dev— {tier.name}"
                  className="mt-6 btn-soft w-full"
                >
                  Get in touch
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Current Sponsors */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">Current sponsors</h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
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
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.tier} sponsor</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="rounded-2xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-12 text-center relative overflow-hidden">
          <div className="cta-glow absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-foreground">Interested in sponsoring?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              We'd love to hear from you. Reach out and we'll find the right sponsorship fit for your goals.
            </p>
            <a
              href="mailto:sponsors@offon.dev?subject=Sponsorship Inquiry"
              className="mt-8 btn-primary"
            >
              Contact us →
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Sponsors;
