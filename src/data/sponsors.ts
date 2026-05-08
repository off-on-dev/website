import dtLogoDark from "@/assets/Dynatrace_Logo_color_negative_horizontal.svg";
import dtLogoLight from "@/assets/Dynatrace_Logo_color_positive_horizontal.svg";

export type Sponsor = {
  name: string;
  url: string;
  logoDark?: string;
  logoLight?: string;
};

export type SupportWay = {
  title: string;
  description: string;
};

export const SPONSORS: Sponsor[] = [
  {
    name: "Dynatrace",
    url: "https://dynatrace.com",
    logoDark: dtLogoDark,
    logoLight: dtLogoLight,
  },
];

export const SUPPORT_WAYS: SupportWay[] = [
  {
    title: "Swag",
    description: "Provide swag for community members and event attendees.",
  },
  {
    title: "Software Licenses",
    description: "Give community members access to tools and platforms for hands-on learning and challenges.",
  },
  {
    title: "Distribution",
    description: "Help spread the word through developer newsletters, event partnerships, or social channels.",
  },
  {
    title: "Adventures and Challenges",
    description: "Sponsor an adventure or challenge and help bring new open source learning content to the community.",
  },
  {
    title: "Engineering and Advocacy Time",
    description: "Contribute the time of your engineers, developer advocates, or technical writers to mentor contributors, review content, or co-author challenges.",
  },
  {
    title: "Infrastructure and Tooling",
    description: "Offer hosting, CI resources, or developer tooling that supports the community's work.",
  },
];
