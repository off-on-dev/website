import { type JSX } from "react";
import { ExternalLink } from "lucide-react";

type CodespacesButtonProps = {
  href: string;
  fullWidth?: boolean;
};

export const CodespacesButton = ({ href, fullWidth = false }: CodespacesButtonProps): JSX.Element => (
  <>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer" aria-describedby="new-tab-hint"
      className={fullWidth ? "btn-primary w-full justify-center" : "btn-primary w-fit"}
    >
      Open in Codespaces <ExternalLink size={14} aria-hidden="true" />
      
    </a>
    <p className={`mt-2.5 text-xs text-faint font-mono${fullWidth ? " text-center" : ""}`}>
      Free GitHub account required
    </p>
  </>
);
