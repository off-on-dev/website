import type { JSX } from "react";
import { User } from "lucide-react";
import { BRAND_NAME } from "@/data/constants";
import { BOARD_MEMBERS } from "@/data/team";
import { PersonNameLink } from "@/components/PersonNameLink";

const AVATAR_SIZE = 80;

export const BoardSection = (): JSX.Element => {
  return (
    <section id="board" className="px-6 md:px-16 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3">
          <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">
            the people
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Board</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
          The board guides the long-term direction of {BRAND_NAME}, stewarding its values, governance, and community priorities.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD_MEMBERS.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6"
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  width={AVATAR_SIZE}
                  height={AVATAR_SIZE}
                  loading="lazy"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-[hsl(var(--surface-border))] bg-[hsl(var(--muted))]"
                >
                  <User size={28} className="text-muted-foreground" />
                </div>
              )}
              <div className="mt-4">
                <PersonNameLink name={member.name} url={member.url} />
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{member.about}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
