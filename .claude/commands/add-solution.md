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

1. Parses the solution input (any format) into structured steps.
2. Downloads any referenced images and converts them to WebP using `cwebp`.
3. Writes `src/data/solutions/<adventure-id>/<level-id>.ts` with the structured content.
4. Runs the generator to update `src/data/solutions/index.ts` and all region patches.
5. Runs the build to verify the output compiles.

---

## Step 0: Get the inputs

Before doing anything else, confirm with the user:

| Input | Description |
|---|---|
| Adventure ID | The kebab-case adventure ID (e.g. `echoes-lost-in-orbit`) |
| Level ID | The level ID: `beginner`, `intermediate`, or `expert` |
| Solution content | The raw content to convert (paste, file path, or URL) |

If any are missing, ask for them now. Do not proceed until all three are provided.

---

## Step 1: Locate the adventure

Find the adventure in `src/data/adventures/index.ts` or the generated files to confirm the IDs are valid:

```bash
grep -r "id: \"<adventure-id>\"" src/data/adventures/
```

If the adventure or level doesn't exist, stop and report it to the user.

---

## Step 2: Parse the input into structured steps

Read the input regardless of format (markdown, YAML, HTML, plain text). Extract:

- **Title** — the solution title (e.g. "Beginner Solution: Broken Echoes"). Never include difficulty emoji. No em dashes.
- **Spoiler warning** — one sentence. Plain text, no markdown.
- **Intro** — one or two sentences. Plain text, no markdown.
- **Context section** (optional) — "Understanding the Setup" or similar. Explains the tooling/architecture before the steps.
- **Steps** — one per numbered objective in the challenge. Each step has:
  - `id` — kebab-case, no numbers (e.g. `two-applications`, `isolated-namespaces`)
  - `title` — title case, no leading emoji
  - `intro` — one to two sentences in plain text
  - `body` — array of `SolutionBlock` (see type below)
  - `takeaways` — array of plain-text strings, sentence case
  - `furtherReading` — array of `{ title, url }` pairs
- **Complete solution** (optional) — the final fixed config or code block

### SolutionBlock types

```typescript
| { type: "text"; html: string }        // HTML paragraph or list — use md-content rules
| { type: "code"; language: string; title?: string; code: string }
| { type: "image"; src: string; alt: string; caption?: string }
| { type: "callout"; variant: "tip" | "warning" | "info"; html: string }
```

**Text blocks:** Write minimal HTML. Use `<p>`, `<ul>`, `<li>`, `<strong>`, `<code>`, and `<a href="...">` only. No `<h1>`–`<h6>` inside text blocks (headings are in the step structure itself). No em dashes anywhere.

**Callout guidance:**
- `tip` — performance tricks, shortcuts, optional improvements
- `warning` — something that can go wrong or has a footgun
- `info` — neutral context that doesn't fit in the main prose

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
4. **Write alt text.** Rules:
   - Describe what is shown, not what it means.
   - One sentence, under 100 characters.
   - No em dashes. Use commas or restructure instead.
   - No "image of", "screenshot of", or similar filler.
   - Example: `"Argo CD dashboard showing no applications"`
5. **Set the `src`** in the TypeScript file to `/solutions/<adventure-id>/<filename>.webp`.

If `cwebp` is not available, report the path to the user and skip the conversion.

---

## Step 4: Write the TypeScript file

Create `src/data/solutions/<adventure-id>/<level-id>.ts`:

```typescript
import type { Solution } from "@/data/solutions/types";

export const solution: Solution = {
  adventureId: "<adventure-id>",
  levelId: "<level-id>",
  title: "<Title>",
  spoilerWarning: "<one sentence>",
  intro: "<one or two sentences>",
  context: {
    title: "Understanding the Setup",
    body: [ /* SolutionBlock[] */ ],
  },
  steps: [
    {
      id: "<kebab-id>",
      title: "<Title Case>",
      intro: "<plain text>",
      body: [ /* SolutionBlock[] */ ],
      takeaways: [ /* plain text strings */ ],
      furtherReading: [ /* { title, url }[] */ ],
    },
    // ... more steps
  ],
  completeSolution: {
    title: "Complete <Thing>",
    description: "<one sentence>",
    language: "<yaml|bash|typescript|...>",
    code: `<the full corrected code>`,
  },
};
```

Rules:
- Use template literals (backtick strings) for multi-line code values.
- Use `JSON.stringify`-style escaping for special characters in other strings.
- No `@ts-ignore`, no `any`.
- Code block values must be raw text (no HTML escaping).
- No em dashes in any string value.

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

Check the built HTML contains the solution content:

```bash
grep -l "solution" dist/client/adventures/<adventure-id>/levels/<level-id>/solution/index.html
```

If the file exists and contains content, report success with the path.

---

## Rules

- Never hardcode the community URL. Use the `COMMUNITY_URL` constant.
- Never add `any` types.
- No em dashes anywhere, including in alt text, takeaways, or prose.
- Code block content goes in the `code` field as raw text, never in HTML `text` blocks.
- Images must be WebP and stored in `public/solutions/<adventure-id>/`.
- Alt text must be specific and informative, not generic ("screenshot", "image").
- Titles use Title Case. Takeaways and body prose use sentence case.
