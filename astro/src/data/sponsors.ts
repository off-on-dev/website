// Sponsor data. Ported from src/data/sponsors.ts (React app).
// In the React app the logos were Vite asset imports from src/assets/.
// Here they are served from the shared public/ dir (publicDir: "../public");
// values are path segments relative to BASE_URL (prepend `import.meta.env.BASE_URL`).

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
    logoDark: "brand/Dynatrace_Logo_color_negative_horizontal.svg",
    logoLight: "brand/Dynatrace_Logo_color_positive_horizontal.svg",
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
