---
name: add-solution
description: >
  Generate a structured TypeScript solution file for a challenge.
  Accepts any input format: markdown, YAML, HTML, or plain text.
  Downloads and converts images to WebP. Produces a file at
  src/data/solutions/<adventure-id>/<level-id>.ts that matches
  the Solution type in src/data/solutions/types.ts.
---

# Add Solution Command

Generate a structured TypeScript solution walkthrough for an OffOn challenge.

## What this command does

1. Gathers inputs, inferring what it can from the content before asking.
2. Parses the solution input (any format) into structured steps.
3. Downloads any referenced images and converts them to WebP using `cwebp`.
4. Writes `src/data/solutions/<adventure-id>/<level-id>.ts` with the structured content.
5. Runs the generator to update `src/data/solutions/index.ts` and all region patches.
6. Runs the build to verify the output compiles.

---

## Step 0: Gather inputs

If the user already provided solution content (pasted HTML, markdown, plain text, or a file path), treat that as the content — do not ask for it again.

For each remaining input, **first try to infer it from the content** before asking. If a value can be inferred with confidence, show it to the user for confirmation rather than asking a blank question.

| Input | Required | How to infer |
| --- | --- | --- |
| Adventure ID | Yes | Look for the challenge or adventure name in the content (title, headings, kicker). Convert to kebab-case. |
| Level ID | Yes | Look for difficulty words in the content (`beginner`, `intermediate`, `expert`). |
| Contributor name | No | Look for an author credit in the content. If not found, ask: "Who wrote this walkthrough? (leave blank to omit)" |

If adventure ID or level ID cannot be inferred confidently, ask for them directly.

Confirm all inferred values with the user before proceeding. A single confirmation message is better than multiple rounds of questions.

---

## Step 1: Locate the adventure

Find the adventure in `src/data/adventures/index.ts` or the generated files to confirm the IDs are valid:

```bash
grep -r "id: \"<adventure-id>\"" src/data/adventures/
```

Also confirm the level exists within that adventure. If either ID does not match, stop and report it.

---

## Step 2: Parse the input into structured steps

Read the input regardless of format (markdown, YAML, HTML, plain text). Extract:

- **`title`** — solution title, e.g. "Intermediate Solution: Governing the Provinces". Never include difficulty emoji. No em dashes.
- **`contributor`** — `{ name: string }` if a contributor was provided. Omit the field entirely if unknown.
- **`spoilerWarning`** — one sentence. Plain text, no markdown.
- **`intro`** — one or two sentences. Plain text, no markdown.
- **`context`** (optional) — a setup section that explains the tooling or architecture the reader needs to understand before the steps. Title should reflect the specific challenge, not a generic phrase. Use "Understanding the Setup" only if nothing more specific fits.
- **`steps`** — one per numbered objective. Each step:
  - `id` — kebab-case, no numbers (e.g. `census-scope`, `isolated-namespaces`)
  - `title` — title case, no leading emoji
  - `intro` — one to two sentences, plain text
  - `body` — array of `SolutionBlock` (see below). Code patches go here as `code` blocks.
  - `takeaways` — plain-text strings, sentence case. Preserve all takeaways from the source. Omit only if a step has no non-obvious insight to share.
  - `furtherReading` — array of `{ title, url }`. These are aggregated into the sidebar across all steps; do not duplicate a URL across multiple steps.
- **`completeSolution`** (optional) — final corrected config or runbook shown as a summary at the end.
- **`outro`** — narrative closing. End with a sentence that follows the adventure's story world, then invite the reader to see how others solved it. Do not use "Got there by a different route?" or similar generic phrases.

### SolutionBlock types

```typescript
| { type: "text"; html: string }        // HTML paragraph or list
| { type: "code"; language: string; title?: string; code: string }
| { type: "image"; src: string; alt: string; caption?: string }
| { type: "callout"; variant: "tip" | "warning" | "info"; html: string }
```

**Text blocks:** Write minimal HTML. Use `<p>`, `<ul>`, `<li>`, `<strong>`, `<code>`, and `<a href="...">` only. No `<h1>`–`<h6>` inside text blocks. No em dashes.

**Callout guidance:**

- `tip` — shortcuts, optional improvements
- `warning` — footguns, things that silently go wrong
- `info` — neutral context that does not fit in the main prose

---

## Step 3: Process images

For every image referenced in the input:

1. **Identify the image URL or local path.**

2. **Download it** to `/tmp/<filename>` using `curl`:

   ```bash
   curl -sL "<url>" -o /tmp/<filename>
   ```

3. **Convert to WebP** using `cwebp` at quality 85:

   ```bash
   /opt/homebrew/bin/cwebp -q 85 /tmp/<filename> -o "public/solutions/<adventure-id>/<level-basename>.webp"
   ```

   Naming convention: `<level-id>-<descriptive-slug>.webp`. Example: `beginner-no-apps.webp`.

4. **Write alt text:** describe what is shown (not what it means), one sentence under 100 characters, no em dashes, no "image of" or "screenshot of" filler.

5. **Set `src`** in the TypeScript file to `/solutions/<adventure-id>/<filename>.webp`.

If `cwebp` is not available, report the path to the user and skip conversion.

---

## Step 4: Write the TypeScript file

Create `src/data/solutions/<adventure-id>/<level-id>.ts`:

```typescript
import type { Solution } from "@/data/solutions/types";

export const solution: Solution = {
  adventureId: "<adventure-id>",
  levelId: "<level-id>",
  title: "<Title>",
  // contributor: { name: "<Name>" },   // include if known; omit entirely if not
  spoilerWarning: "<one sentence>",
  intro: "<one or two sentences>",
  // context: {                          // include only when needed
  //   title: "<Specific Title>",
  //   body: [ /* SolutionBlock[] */ ],
  // },
  steps: [
    {
      id: "<kebab-id>",
      title: "<Title Case>",
      intro: "<plain text>",
      body: [ /* SolutionBlock[] */ ],
      takeaways: [ /* plain-text strings */ ],
      furtherReading: [ /* { title, url }[] */ ],
    },
    // ... more steps
  ],
  // completeSolution: {                 // include when there is a single corrected artefact
  //   title: "Complete <Thing>",
  //   description: "<one sentence>",
  //   language: "<yaml|bash|typescript|...>",
  //   code: `<the full corrected code>`,
  // },
  outro: {
    heading: "<Story-world heading>",
    html: "<p><Narrative close following the adventure story.></p><p><Invite to see how others solved it.></p>",
  },
};
```

Rules:

- Use template literals for multi-line `code` values.
- No `@ts-ignore`, no `any`.
- Code block content goes in the `code` field as raw text, never in HTML text blocks.
- No em dashes in any string value.
- Optional fields (`contributor`, `context`, `completeSolution`) must be omitted entirely when not used, not set to `null` or `undefined`.

---

## Step 5: Run the generator and verify

```bash
node scripts/generate-solutions.mjs
npm run build
npm run lint
```

If lint or build fail, fix the issues before reporting done.

---

## Step 6: Verify the output

Check the built HTML contains the solution title:

```bash
grep -c "<solution-title-fragment>" dist/client/adventures/<adventure-id>/levels/<level-id>/solution/index.html
```

Use a unique word from the solution title as the fragment. If a contributor was provided, also confirm their name appears:

```bash
grep -c "<contributor-name>" dist/client/adventures/<adventure-id>/levels/<level-id>/solution/index.html
```

Report success with the path if both pass.

---

## Rules

- Never hardcode the community URL. Use the `COMMUNITY_URL` constant.
- Never add `any` types.
- No em dashes anywhere — in alt text, takeaways, prose, or heading strings.
- Code block content goes in the `code` field as raw text, never in `text` HTML blocks.
- Images must be WebP and stored in `public/solutions/<adventure-id>/`.
- Alt text must be specific and informative, not generic.
- Titles use Title Case. Takeaways and body prose use sentence case.
- **Contributor:** include `contributor: { name }` when the walkthrough author is known. Omit the field if unknown. Never fabricate a name.
- **Outro:** always include one. End with a narrative sentence that follows the adventure's story world (characters, setting, mission), then a sentence inviting the reader to see how others solved it. The "Browse the discussion" link in the component handles the CTA itself.
- **Takeaways:** preserve all takeaways from the source. Omit only if a step has no non-obvious insight. Do not cap or trim them.
- **Context section:** include only when the reader needs background on the tooling or architecture before they can understand the steps. If steps are self-contained, omit it.
