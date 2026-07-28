// Central registry of Lucide icons used with dynamic names in this codebase.
// All icons are imported statically so unplugin-icons can inline them at build time.
// Add an entry here before using a new icon name dynamically.
import type { Component } from "vue";

import IconArrowDown from "~icons/lucide/arrow-down";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconBookOpen from "~icons/lucide/book-open";
import IconBuilding2 from "~icons/lucide/building-2";
import IconCalendarDays from "~icons/lucide/calendar-days";
import IconCheck from "~icons/lucide/check";
import IconChevronDown from "~icons/lucide/chevron-down";
import IconChevronRight from "~icons/lucide/chevron-right";
import IconCircleHelp from "~icons/lucide/circle-help";
import IconClock from "~icons/lucide/clock";
import IconCloud from "~icons/lucide/cloud";
import IconCompass from "~icons/lucide/compass";
import IconCopy from "~icons/lucide/copy";
import IconDownload from "~icons/lucide/download";
import IconExternalLink from "~icons/lucide/external-link";
import IconFlaskConical from "~icons/lucide/flask-conical";
import IconGitFork from "~icons/lucide/git-fork";
import IconGlobe from "~icons/lucide/globe";
import IconHammer from "~icons/lucide/hammer";
import IconHandHeart from "~icons/lucide/hand-heart";
import IconHeart from "~icons/lucide/heart";
import IconLaptop from "~icons/lucide/laptop";
import IconLayers from "~icons/lucide/layers";
import IconMail from "~icons/lucide/mail";
import IconMegaphone from "~icons/lucide/megaphone";
import IconMessageCircle from "~icons/lucide/message-circle";
import IconPresentation from "~icons/lucide/presentation";
import IconSatellite from "~icons/lucide/satellite";
import IconScale from "~icons/lucide/scale";
import IconShield from "~icons/lucide/shield";
import IconSparkles from "~icons/lucide/sparkles";
import IconStar from "~icons/lucide/star";
import IconTarget from "~icons/lucide/target";
import IconTelescope from "~icons/lucide/telescope";
import IconTrendingUp from "~icons/lucide/trending-up";
import IconTrophy from "~icons/lucide/trophy";
import IconUser from "~icons/lucide/user";
import IconUserPlus from "~icons/lucide/user-plus";
import IconWrench from "~icons/lucide/wrench";
import IconX from "~icons/lucide/x";
import IconZap from "~icons/lucide/zap";

export const LUCIDE_ICONS: Record<string, Component> = {
  "arrow-down": IconArrowDown,
  "arrow-left": IconArrowLeft,
  "arrow-right": IconArrowRight,
  "book-open": IconBookOpen,
  "building-2": IconBuilding2,
  "calendar-days": IconCalendarDays,
  check: IconCheck,
  "chevron-down": IconChevronDown,
  "chevron-right": IconChevronRight,
  "circle-help": IconCircleHelp,
  clock: IconClock,
  cloud: IconCloud,
  compass: IconCompass,
  copy: IconCopy,
  download: IconDownload,
  "external-link": IconExternalLink,
  "flask-conical": IconFlaskConical,
  "git-fork": IconGitFork,
  globe: IconGlobe,
  hammer: IconHammer,
  "hand-heart": IconHandHeart,
  heart: IconHeart,
  laptop: IconLaptop,
  layers: IconLayers,
  mail: IconMail,
  megaphone: IconMegaphone,
  "message-circle": IconMessageCircle,
  presentation: IconPresentation,
  satellite: IconSatellite,
  scale: IconScale,
  shield: IconShield,
  sparkles: IconSparkles,
  star: IconStar,
  target: IconTarget,
  telescope: IconTelescope,
  "trending-up": IconTrendingUp,
  trophy: IconTrophy,
  user: IconUser,
  "user-plus": IconUserPlus,
  wrench: IconWrench,
  x: IconX,
  zap: IconZap,
};
