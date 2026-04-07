import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Docs</span>
        <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
          Documentation is on its way.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          We're building out guides for getting started, running your first challenge, contributing, and everything in between. Check back soon.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary">
            ← Back to Home
          </Link>
          <a
            href="https://community.offon.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Visit the community
          </a>
        </div>

        <div className="mt-16 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 text-left">
          <h2 className="text-lg font-semibold text-foreground mb-4">What we're planning to document</h2>
          <ul className="space-y-3">
            {[
              "Getting started — joining the community, your first post",
              "Challenges — finding, attempting, and submitting solutions",
              "Contributing — how to propose content, flag issues, and help improve things",
              "Code of conduct and community guidelines",
              "Governance — how decisions get made",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Docs;
