import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { renderField } from "./lib/md";

// Crafted markdown to prove BOTH that markdown renders AND that rehype-sanitize
// strips dangerous HTML at build time.
const SANITIZE_PROOF =
  "Bold **works** and a [link](https://offon.dev). " +
  'Dangerous <script>alert(1)</script> and <img src=x onerror="alert(1)"> must be stripped.';

const adventures = defineCollection({
  // Read the REAL adventure YAML from the existing app's data dir.
  loader: glob({
    pattern: "*/adventure.yaml",
    base: "../src/data/adventures",
    generateId: ({ entry }) => entry.replace(/\/adventure\.yaml$/, ""),
  }),
  // Partial schema: model the fields the spike touches. Zod strips unmodeled
  // keys by default (no error), so the large real YAML validates fine.
  //
  // REAL-DATA FINDING: the YAML is NOT uniform. Some adventures use `title` +
  // `story`; others (dead-reckoning, lex-imperfecta) use `name` +
  // `meta_description`. The real migration's schema must normalize these
  // variants (as generate-adventures.mjs does today). Modeled here as optional
  // + normalized in the transform.
  schema: z
    .object({
      slug: z.string(),
      title: z.string().optional(),
      name: z.string().optional(),
      story: z.string().optional(),
      meta_description: z.string().optional(),
      contributor: z.object({
        name: z.string(),
        url: z.string(),
        about: z.string(), // author-written markdown
      }),
    })
    .transform(async (data) => ({
      slug: data.slug,
      title: data.title ?? data.name ?? data.slug,
      story: data.story ?? data.meta_description ?? "",
      contributor: data.contributor,
      // The crux: a markdown data-field -> sanitized HTML, inside the collection,
      // with the output typed through getCollection/getEntry.
      contributorAboutHtml: await renderField(data.contributor.about),
      sanitizeProofHtml: await renderField(SANITIZE_PROOF),
    })),
});

export const collections = { adventures };
