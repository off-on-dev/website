import { KATHARINA_SICK } from "@/data/adventures/contributors";
import davidImage from "@/assets/team/david.webp";
import katharinaImage from "@/assets/team/katharina.webp";
import kenyattaImage from "@/assets/team/kenyatta.webp";
import sinduriImage from "@/assets/team/sinduri.webp";

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
    about: "Head of Community and Open Source at Dynatrace, leading a cross-functional Community and OSPO team. Co-founder of KCD Austria with a focus on open source governance, ecosystem building, and turning open source into a strategic asset. Recently completed an MBA with a thesis on internal development versus open source.",
    image: davidImage,
  },
  {
    name: KATHARINA_SICK.name,
    url: KATHARINA_SICK.url,
    about: KATHARINA_SICK.about ?? "",
    image: katharinaImage,
  },
  {
    name: "Kenyatta Forbes",
    url: "https://www.linkedin.com/in/kenyatta-f/",
    about: "Sr Program Manager at Dynatrace, focused on cross-functional collaboration at the intersection of education, open source, and technology. Previously led product pilots reaching 189 million Google Classroom users at Google for Education and ran open internet programs at Mozilla. Started her career as an educator and technology coordinator for Chicago Public Schools.",
    image: kenyattaImage,
  },
  {
    name: "Sinduri Guntupalli",
    url: "https://www.linkedin.com/in/sinduri-guntupalli-307542131/",
    about: "Sr Developer Programs Engineer at Dynatrace, with a background in web development, configuration management, web analytics, and SEO. Active in the Drupal community as Marketing Manager for Drupal Austria and recipient of the Women in Drupal Award (Build). Open source enthusiast, positivity advocate, and continuous learner.",
    image: sinduriImage,
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
