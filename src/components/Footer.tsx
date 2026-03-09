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
          <span className="text-sm text-muted-foreground">
            · Vendor-neutral open source &amp; cloud-native education
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="https://community.offon.dev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Community</a>
          <a href="https://github.com/dynatrace-oss/offon-challenges" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Challenges Repo</a>
          <a href="https://github.com/dynatrace-oss/offon-challenge-verifier" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Verifier</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
        </div>
      </div>
    </footer>
  );
};
