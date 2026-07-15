import type { JSX } from "react";
import { Building2, Compass, Cloud, FlaskConical, Satellite, Scale, Telescope, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Building2,
  Compass,
  Cloud,
  FlaskConical,
  Satellite,
  Scale,
  Telescope,
};

type AdventureIconProps = {
  icon?: string;
  size?: number;
  className?: string;
};

export const AdventureIcon = ({ icon, size = 16, className }: AdventureIconProps): JSX.Element | null => {
  if (!icon) return null;
  const Icon = ICONS[icon];
  if (!Icon) return null;
  return <Icon size={size} aria-hidden="true" className={className} />;
};
