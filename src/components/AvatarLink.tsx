import { useState, type CSSProperties, type JSX } from "react";

type AvatarLinkProps = {
  username: string;
  avatarUrl?: string;
  /** Avatar diameter in pixels. Defaults to 24. */
  size?: 24 | 28;
  /** Inline style for the initials fallback (background + text color). */
  avatarFallbackStyle?: CSSProperties;
  /** Class applied to the username span element. */
  className: string;
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
  className,
}: AvatarLinkProps): JSX.Element => {
  const sizeClass = SIZE_CLASSES[size];
  // Avatars are external (Discourse). If one fails to load, fall back to the
  // initials chip instead of leaving a broken image.
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <>
      {avatarUrl && !imgFailed ? (
        <img
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
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
      <span className={className}>
        <span className="truncate">{username}</span>
      </span>
    </>
  );
};
