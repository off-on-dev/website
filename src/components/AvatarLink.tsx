import type { CSSProperties, JSX } from "react";
import { ExternalLink } from "lucide-react";
import { COMMUNITY_URL } from "@/data/constants";

type AvatarLinkProps = {
  username: string;
  avatarUrl?: string;
  /** Avatar diameter in pixels. Defaults to 24. */
  size?: 24 | 28;
  /** Inline style for the initials fallback (background + text color). */
  avatarFallbackStyle?: CSSProperties;
  /** Class applied to the profile link element. */
  linkClassName: string;
};

const SIZE_CLASSES: Record<24 | 28, string> = {
  24: "h-6 w-6",
  28: "h-7 w-7",
};

export const AvatarLink = ({
  username,
  avatarUrl,
  size = 24,
  avatarFallbackStyle,
  linkClassName,
}: AvatarLinkProps): JSX.Element => {
  const sizeClass = SIZE_CLASSES[size];
  const iconSize = size === 28 ? 12 : 10;

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          loading="lazy"
          className={`${sizeClass} rounded-full shrink-0 object-cover`}
        />
      ) : (
        <span
          className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-muted text-[0.6rem] font-semibold text-foreground`}
          style={avatarFallbackStyle}
          aria-hidden="true"
        >
          {username.slice(0, 2).toUpperCase()}
        </span>
      )}
      <a
        href={`${COMMUNITY_URL}/u/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        <span className="truncate">{username}</span>
        <ExternalLink size={iconSize} aria-hidden="true" className="shrink-0" />
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    </>
  );
};
