// Board member data. Ported from src/data/team.ts.
// The React source pulled Katharina Sick's name/url/about from
// src/data/adventures/contributors.ts (KATHARINA_SICK); those values are
// inlined here so this module has no cross-source dependency.

export type BoardMember = {
  name: string;
  url?: string;
  about: string;
  image?: string;
};

// Alphabetical by first name. Placeholders kept at the end until seats are filled.
export const BOARD_MEMBERS: BoardMember[] = [
  {
    name: "David Hirsch",
    url: "https://davidpeterhirsch.com/",
    about:
      "Head of Community and Open Source at Dynatrace, leading a cross-functional Community and OSPO team. Co-founder of KCD Austria with a focus on open source governance, ecosystem building, and turning open source into a strategic asset. Recently completed an MBA with a thesis on internal development versus open source.",
    image: "team/david.webp",
  },
  {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    about:
      "Senior Developer Programs Engineer at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
    image: "team/katharina.webp",
  },
  {
    name: "Kenyatta Forbes",
    url: "https://www.linkedin.com/in/kenyatta-f/",
    about:
      "Sr Program Manager at Dynatrace, focused on cross-functional collaboration at the intersection of education, open source, and technology. Previously led product pilots reaching 189 million Google Classroom users at Google for Education and ran open internet programs at Mozilla. Started her career as an educator and technology coordinator for Chicago Public Schools.",
    image: "team/kenyatta.webp",
  },
  {
    name: "Sinduri Guntupalli",
    url: "https://www.linkedin.com/in/sinduri-guntupalli-307542131/",
    about:
      "Sr Developer Programs Engineer at Dynatrace, with a background in web development, configuration management, web analytics, and SEO. Active in the Drupal community as Marketing Manager for Drupal Austria and recipient of the Women in Drupal Award (Build). Open source enthusiast, positivity advocate, and continuous learner.",
    image: "team/sinduri.webp",
  },
  // TODO: replace placeholder with confirmed board member
  {
    name: "To be announced",
    about: "Board seat to be announced.",
  },
  // TODO: replace placeholder with confirmed board member
  {
    name: "To be announced",
    about: "Board seat to be announced.",
  },
];

export type AdventureContributor = {
  name: string;
  url?: string;
  aboutHtml?: string;
  adventures: { id: string; title: string }[];
};

// Build-time snapshot of ADVENTURE_CONTRIBUTORS, derived in the React app from
// ADVENTURE_SUMMARIES (src/data/adventures/summaries.ts) and grouped by person.
// Regenerate when adventure contributor fields change.
export const ADVENTURE_CONTRIBUTORS: AdventureContributor[] = [
  {
    name: "Katharina Sick",
    url: "https://ksick.dev/",
    aboutHtml:
      "DevRel at Dynatrace and co-organizer of Cloud Native Linz. Passionate about building user-friendly Cloud Native and Kubernetes solutions, with a background in mobile and backend development. Found in tech and sports communities, inline skating rinks, and quiz nights across Europe.",
    adventures: [
      { id: "dead-reckoning", title: "Dead Reckoning" },
      { id: "lex-imperfecta", title: "Lex Imperfecta" },
      { id: "the-ai-observatory", title: "The AI Observatory" },
      { id: "building-cloudhaven", title: "Building CloudHaven" },
      { id: "echoes-lost-in-orbit", title: "Echoes Lost in Orbit" },
    ],
  },
  {
    name: "Simon Schrottner",
    url: "https://schrottner.at/",
    aboutHtml:
      "CNCF Ambassador and maintainer of OpenFeature and JUnit Pioneer. Helps teams release faster and with more confidence through open standards, feature flagging, and the communities that make both possible. A familiar face at KubeCon EU, Devoxx, ContainerDays, and meetups across Europe.",
    adventures: [{ id: "blind-by-design", title: "Blind by Design" }],
  },
];
