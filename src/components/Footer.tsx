import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-[hsl(var(--surface-border))] py-10 px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="offon.dev"
            className="h-5"
          />
          <span className="text-sm text-foreground/60">
            · Vendor-neutral · Open source · Community-driven
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="https://community.offon.dev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Community</a>
          <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <a href="https://github.com/dynatrace-oss/offon-challenges" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Challenges Repo</a>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/sponsors" className="hover:text-foreground transition-colors">Sponsors</Link>
        </div>
      </div>
    </footer>
  );
};
