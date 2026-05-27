import { type ReactNode, type JSX } from "react";

type SidebarLayoutProps = {
  children: ReactNode;
  aside?: ReactNode;
};

/**
 * Renders children in a two-column grid when `aside` is provided (lg+),
 * with the sidebar column sticky at the top. Falls back to rendering
 * children alone when `aside` is omitted.
 *
 * Used by CommunitySection, ChallengeBuildersSection, and CommunityGuide
 * so the sticky-sidebar grid is defined in one place.
 */
export const SidebarLayout = ({ children, aside }: SidebarLayoutProps): JSX.Element => {
  if (!aside) return <>{children}</>;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
      {children}
      <div className="hidden lg:block">
        <div className="sticky top-24">{aside}</div>
      </div>
    </div>
  );
};
