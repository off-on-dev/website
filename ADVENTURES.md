# Adventures

This file covers both sides of the adventure process: **challenge authors** working in the challenges repo and **website reviewers** completing the PR checklist after a sync.

Adventures live in a separate repo ([open-source-challenges](https://github.com/off-on-dev/open-source-challenges)) and are pulled into this site via the **Sync Adventure** GitHub Actions workflow. You never write the generated TypeScript files by hand; the workflow and build scripts do that automatically.

**Jump to:**

- [YAML Templates](#yaml-templates): full field reference for challenge authors
- [Syncing a New Adventure](#syncing-a-new-adventure): trigger the workflow
- [Completing the PR Checklist](#completing-the-pr-checklist): what to do after the sync
- [Architecture Diagrams](#architecture-diagrams): SVG, ASCII art, and prose fields
- [Re-syncing an Open PR](#re-syncing-an-open-pr): updating an in-progress PR
- [Adding a Solution Walkthrough](#adding-a-solution-walkthrough): post-challenge write-ups

---

## How the Content Pipeline Works

```text
off-on-dev/open-source-challenges          offon.dev website repo
  adventures/<id>/docs/
    index.yaml          ──── Sync Adventure workflow ────►  src/data/adventures/<slug>/adventure.yaml
    beginner.yaml                                            src/data/adventures/<slug>/<level>-posts.json
    intermediate.yaml   ──── npm run generate (prebuild) ──►  src/data/adventures/<slug>.generated.ts
    ...                                                       src/data/adventures/index.ts
    diagrams/                                                 src/data/adventures/summaries.ts
      <slug>-<level>.svg ─────────────────────────────────►  src/assets/diagrams/<slug>-<level>.svg
```

The sync workflow also regenerates `public/sitemap.xml`, `react-router.config.ts`, `e2e/smoke.spec.ts`, `src/test/seo.test.ts`, `src/test/prerender.test.ts`, and `scripts/refresh-leaderboard.mjs`. All of these appear in the PR diff; they are managed automatically and should not be edited by hand.

The generated TypeScript files are committed so the dev server works without running the generator manually. Never edit `*.generated.ts`, `index.ts`, or `summaries.ts` by hand.

---

## YAML Templates

Full field reference for challenge authors. All fields are shown with example values. Remove any that do not apply to your adventure.

### `docs/index.yaml` (adventure-level metadata)

```yaml
# Title of the adventure. Use `title` (preferred) or `name`.
title: "My Adventure Title"
emoji: 🚀

# Optional: Lucide icon name to use instead of the emoji icon.
# Accepts any valid Lucide icon name (e.g. "Shield", "Cpu", "GitBranch").
# icon: Shield

# Tags drive the tag-filter UI and default `topics` for each level.
# Use the canonical tool/platform names shown on the OffOn website.
tags:
  - Kubernetes
  - Argo CD
  - Helm

# Optional: overrides the auto-generated SEO meta description for the adventure page.
# Keep under 160 characters.
# meta_description: "Fix broken Kyverno policies to restore proper admission control."

# One or more story paragraphs. Markdown is supported.
backstory:
  - "Opening paragraph that sets the scene."
  - "Second paragraph continuing the story."

# Optional: an overview of the challenge shown before the story.
# Useful when backstory is long and reviewers need a quick summary.
overview:
  - "Brief, direct summary of what the participant will fix or build."

rewards:
  # ISO 8601 or human-readable: "Tuesday, 1 July 2026 at 23:59 CET"
  # Supported TZ abbreviations: CET (+01:00), CEST (+02:00), UTC, GMT
  deadline: "2026-09-01T23:59:00+01:00"
  tiers:
    - label: 1st place
      description: 50% voucher for a Linux Foundation certification
    - label: Top 3
      description: Credly badge to showcase the achievement
  # Optional: overrides the default eligibility text on the rewards card.
  # eligibility: "Open to all registered participants who submit before the deadline."
  # Optional: overrides the default ranking note on the rewards card.
  # ranking_note: "Ranked by verification timestamp; ties broken by submission order."
```

---

### `docs/<level>.yaml` (level content)

One file per level: `beginner.yaml`, `intermediate.yaml`, `expert.yaml`.

```yaml
# Required. Must match the filename: beginner | intermediate | expert
level: beginner
emoji: 🟢        # 🟢 beginner  🟡 intermediate  🔴 expert
title: "Level Title"

# Devcontainer folder name in off-on-dev/open-source-challenges/.devcontainer/
# The generator auto-corrects this if it finds an unambiguous match.
devcontainer: my-adventure_beginner

# Optional: upgrade the default Codespace machine size.
# Only set this when the level genuinely needs more RAM or CPU.
codespaces_machine: 4core

# Optional: estimated completion time shown as a pill on the level card.
estimated_time: "2-3 hours"

# One sentence shown on the adventure card and the level sidebar.
summary: "Fix the broken X so that Y works end to end."

# Who this level is for. Markdown, inline code, and <abbr> are supported.
# Use <abbr title="full term">ABBR</abbr> for acronyms on first use.
audience: >-
  Platform engineers, <abbr title="Site Reliability Engineers">SREs</abbr>, and developers
  curious about X. No prior experience needed, but familiarity with basic
  `kubectl` and YAML will help.

# Optional: a short hook shown at the top of the level page, before the story.
# hook: "The cluster is on fire and the policies that should protect it are broken."

# Optional: the in-world scenario framing the level's context.
# scenario: "You have been granted emergency access to the broken cluster."

# Level-specific story paragraphs. Markdown is supported.
backstory:
  - "What went wrong and why it matters."
  - "What the participant's role is in fixing it."

# Bullet-point acceptance criteria. Markdown is supported.
# Keep each item concrete and testable. Use **bold** to call out key terms.
objective:
  - "All workloads **missing the `required-label`** are blocked at admission."
  - "All verification checks pass."

# What skills and concepts the participant will practise.
# Use [linked text](url) for official docs. Use `backticks` for tool names.
what_you_learn:
  - "How [X](https://example.com/docs) works and why it matters."
  - "How to use `kubectl` logs to trace a silent failure across tools."

# Architecture explanation. Shown under the Architecture heading on the level page.
# Use an array; each item becomes a separate prose block.
architecture:
  - "High-level description of the system the participant is working in."
  - "Which files or resources they need to touch, and which to leave alone."

# Optional: SVG architecture diagram.
# Place the SVG at docs/diagrams/<slug>-<level>.svg in the challenges repo.
# The sync auto-fetches it. Name must match the filename exactly.
architecture_diagram: "my-adventure-beginner.svg"
diagram_alt: "Left-to-right diagram showing how X connects to Y and Z."

# Optional: ASCII art fallback when no SVG is available.
# Use a YAML block scalar (|) to preserve whitespace and line breaks.
# architecture_ascii: |
#   ┌──────────┐       ┌──────────┐
#   │  Client  │──────►│   API    │
#   └──────────┘       └──────────┘

# Tools the participant will use. Shown as a toolbox on the level page.
toolbox:
  - name: Tool Name
    url: https://example.com/docs
    description: "What it does in this challenge and how to open it."

# Optional: running services exposed on local ports (Codespace / devcontainer).
# Omit if there are no local services.
services:
  - name: My Service
    port: 8080
    credentials: admin / password   # omit if no login required
    description: "What this service is and what to look for in it."

# Step-by-step guide shown in the How to Play tab.
# Markdown, inline code, <abbr>, and fenced code blocks are supported in both
# `title` and `content`. The `id` field is informational only; it is not used
# by the generator or the website.
how_to_play:
  - id: start
    title: "Start the Environment"
    content: |
      Start the platform with `make start`. The first run may take ~30-60 seconds
      to pull images. Once it's up, leave it running in that terminal.
  - id: explore
    title: "Explore the Setup"
    content: |
      Open the <abbr title="Command Line Interface">CLI</abbr> and inspect the
      running resources:

      ```bash
      kubectl get pods -A
      ```

      Look at what is deployed and note anything that looks broken or missing.
  - id: fix
    title: "Fix It"
    content: |
      The bug lives in `path/to/file.yaml`. Edit it directly and re-apply:

      ```bash
      kubectl apply -f path/to/file.yaml
      ```

      When you think it's fixed, run the verification script:

      ```bash
      make verify
      ```

# Optional: further reading shown at the bottom of the level page.
helpful_links:
  - title: "Official Docs: Feature Name"
    url: https://example.com/docs/feature
    description: "One sentence on why this link is useful for this challenge."

# Optional: refine the default topics (which default to all adventure tags).
# Only set this when the level uses a subset of the adventure's tools.
# topics:
#   - Kubernetes
#   - Argo CD

# Optional: override the verification step shown at the end of How to Play.
# Omit to use the standard verify.sh description.
# verification:
#   command: make verify
#   description: "What the script checks and what a passing result looks like."
```

---

## Syncing a New Adventure

### 1. Trigger the workflow

Go to **Actions → Sync Adventure from Challenges Repo → Run workflow**.

| Input | Required | Description |
| --- | --- | --- |
| `adventure_url` | Yes | GitHub URL of the adventure folder. Any branch works. Main: `https://github.com/off-on-dev/open-source-challenges/tree/main/adventures/05-lex-imperfecta`. PR branch: `https://github.com/off-on-dev/open-source-challenges/tree/feat/my-branch/adventures/05-lex-imperfecta`. |
| `levels` | No | Comma-separated level IDs to make live now (e.g. `beginner` or `beginner,intermediate`). Levels that exist in the challenges repo but are not listed here appear as "Coming Soon" placeholders. Leave blank to make all levels live. |

### 2. What the workflow does

1. Validates the URL points to `off-on-dev/open-source-challenges`.
2. If a PR branch (`feat/adventure-<slug>`) already exists, restores `adventure.yaml` from that branch so any manual edits already made survive the re-sync.
3. Fetches `docs/index.yaml` and all level YAMLs from the challenges repo. For any level with `architecture_diagram` set, auto-fetches the SVG from `docs/diagrams/` and writes it to `src/assets/diagrams/`.
4. Writes `src/data/adventures/<slug>/adventure.yaml` and creates `<level>-posts.json` stubs for each new live level.
5. Runs `generate-adventures.mjs` to regenerate TypeScript, sitemap entries, prerender entries, and test arrays.
6. Opens (or updates) a PR on `feat/adventure-<slug>` with a checklist of steps to complete before merging.

---

## Completing the PR Checklist

The PR body lists everything that needs to happen before merging. Complete the items in order; some steps depend on earlier ones.

### 1. Add contributor block

```yaml
contributor:
  name: "Full Name"
  url: "https://example.com"
  about: "One sentence bio."
```

Add this to `src/data/adventures/<slug>/adventure.yaml`. The `url` and `about` fields are optional but recommended. This block survives all future re-syncs once set.

### 2. Confirm month

The `month:` field defaults to the current month when first synced. Correct it if the adventure is planned for a future release. Format: `MMM YYYY` (e.g. `JAN 2026`). This field survives all future re-syncs once set.

### 3. Set community_category_id

1. Look up the Discourse category at `https://community.offon.dev/categories.json`.
2. Find the category for this adventure and copy its `id` integer.
3. Add `community_category_id: <id>` to `adventure.yaml`.
4. Run `npm run generate` to regenerate TypeScript.

This field survives all future re-syncs once set.

### 4. Update rewards deadline

Change `rewards.deadline` from `TODO` to an ISO 8601 datetime or the human-readable format accepted by the generator:

```yaml
rewards:
  # ISO 8601 (preferred)
  deadline: "2026-07-01T23:59:00+01:00"

  # Human-readable (the generator converts it automatically)
  # deadline: "Tuesday, 1 July 2026 at 23:59 CET"
```

Supported timezone abbreviations: `CET` (+01:00), `CEST` (+02:00), `UTC` (+00:00), `GMT` (+00:00). Unrecognised abbreviations are left as-is and logged as warnings during generation.

### 5. Review topics

Each level's `topics:` list defaults to all adventure tags. Refine it to the subset of technologies actually used in that specific level. The challenges repo value wins on re-sync when set explicitly there; a manually refined value in `adventure.yaml` is only preserved when the challenges repo leaves `topics:` unset. See [What is preserved on re-sync](#what-is-preserved-on-re-sync) for the full rules.

### 6. Check architecture diagrams

If the challenge author added an SVG to `docs/diagrams/` in the challenges repo, the sync fetches it automatically and no action is needed. If the sync log shows a warning that a diagram was not found, see [Architecture Diagrams](#architecture-diagrams) for the fallback steps.

### 7. Update discussion_url

Once you have created the Discourse thread for a level, use the **Add Discussion URL to Level** workflow (Actions tab → Add Discussion URL to Level → Run workflow).

| Input | Description |
| --- | --- |
| `adventure_id` | Adventure slug, e.g. `lex-imperfecta` |
| `level_id` | `beginner`, `intermediate`, or `expert` |
| `discussion_url` | Full Discourse thread URL, e.g. `https://community.offon.dev/t/slug/1419` |

The workflow updates `discussion_url` in `adventure.yaml`, fetches the initial posts from Discourse, regenerates TypeScript, and opens a PR. Run it once per level. If the thread is brand-new and has no posts yet, the PR will contain an empty `discussionPosts` array; the hourly `refresh-community-data` workflow will populate it once posts appear.

`discussion_url` is a website-only field. It is never in the challenges repo and survives every re-sync automatically.

### 8. Run the leaderboard script

```sh
node scripts/refresh-leaderboard.mjs
```

Run this after `community_category_id` is set. It adds the adventure to the leaderboard data used on the site. See [Refresh Scripts](#refresh-scripts) for credential setup.

### 9. Verify devcontainer paths

`generate-adventures.mjs` cross-checks each level's `devcontainer:` value against the actual folder names in [`off-on-dev/open-source-challenges/.devcontainer`](https://github.com/off-on-dev/open-source-challenges/tree/main/.devcontainer) via `gh api`.

**In generate mode** (the default, including the sync workflow): if a value is wrong but an unambiguous match can be found by slug and difficulty, the YAML is patched in place and a warning is printed:

```text
Warning: <slug> levels[0]: devcontainer auto-corrected "<wrong>" → "<correct>" — update adventure.yaml in the challenges repo
```

If you see this warning, also fix the `devcontainer:` value upstream in the challenges repo so the next sync does not reintroduce the wrong value.

**In `--validate-only` mode** (`npm run generate:validate`, used by CI): wrong values are always hard errors with no auto-correction.

If `gh` is unavailable or unauthenticated, the check is skipped with a warning and generation proceeds.

### 10. Update llms.txt

`generate-adventures.mjs` patches `public/llms.txt` automatically, but the sync workflow does not commit that file. Run the generator locally and commit the result:

```sh
npm run generate
git add public/llms.txt
git commit -s -m "chore: update llms.txt for <slug>"
```

Confirm the adventure appears under the Adventures section in `public/llms.txt` with the correct title and URL before pushing.

### 11. Run the a11y audit

After the build passes, run the accessibility audit against any new or changed pages:

```sh
/a11y-audit
```

Target any new adventure or level detail pages. All severity-weighted findings must be resolved before merging.

### 12. Final checks

```sh
npm run lint && npm run lint:reuse && npm test && npm run build && npm run test:e2e
```

All checks must pass before merging.

---

## Architecture Diagrams

Each level can display an SVG diagram, an ASCII art fallback, and one or more prose paragraphs. All are rendered under the **Architecture** heading on the challenge page.

| Field | Type | Renders as |
| --- | --- | --- |
| `architecture_diagram` | SVG filename | `<img>` (takes priority over `architecture_ascii`) |
| `diagram_alt` | string | Accessible alt text for the SVG. Required when `architecture_diagram` is set. |
| `architecture_ascii` | YAML block scalar (`\|`) | `<pre>` block, shown when no SVG is present |
| `architecture` | array of Markdown strings | Prose paragraphs always rendered below the diagram or ASCII block |

### SVG in the challenges repo (normal path)

Add the SVG to the challenges repo at:

```text
adventures/<slug>/docs/diagrams/<slug>-<level>.svg
```

Name it after the adventure slug and level: `dead-reckoning-intermediate.svg`, `lex-imperfecta-beginner.svg`. Then add the fields to the level YAML in the challenges repo:

```yaml
architecture_diagram: "dead-reckoning-intermediate.svg"
diagram_alt: "One sentence describing what the diagram shows."
architecture:
  - "Prose paragraph explaining the architecture."
  - "Second paragraph if needed."
```

The sync auto-fetches the SVG from `docs/diagrams/` and writes it to `src/assets/diagrams/`. No action is needed on the website side.

### SVG already in the website repo (fallback)

If the SVG exists in `src/assets/diagrams/` on the website repo but not in the challenges repo (added manually before the auto-fetch path existed), the sync recognises it and re-adds `architecture_diagram` to the level automatically. Check that `architecture_diagram` and `diagram_alt` are set for that level in `adventure.yaml`:

```yaml
architecture_diagram: "<slug>-<level>.svg"
diagram_alt: "One sentence describing what the diagram shows."
```

### ASCII art fallback

When no SVG is available, use `architecture_ascii` with a YAML block scalar to preserve whitespace:

```yaml
architecture_ascii: |
  ┌──────────┐       ┌──────────┐       ┌──────────┐
  │  Client  │──────►│   API    │──────►│    DB    │
  └──────────┘       └──────────┘       └──────────┘
```

All architecture fields survive every re-sync once set.

---

## Re-syncing an Open PR

If the challenges repo is updated while your PR is still open, or you want to promote a "Coming Soon" level to live, run the workflow again with the same (or updated) inputs. You do not need to close or recreate the PR.

### What happens

1. The workflow detects that `feat/adventure-<slug>` already exists.
2. It restores `adventure.yaml` from the PR branch so any manual edits already made are available to the sync script.
3. Fresh content is fetched from the challenges repo.
4. `mergeLevels` merges the incoming content with the existing levels, preserving certain fields (see table below).
5. The PR branch is force-pushed with the updated content.
6. The open PR is updated in place (title, body).

### What is preserved on re-sync

| Field | Preserved | Notes |
| --- | --- | --- |
| `contributor:` (adventure) | Always | Survives every re-sync once set |
| `community_category_id:` (adventure) | Always | Survives every re-sync once set; position is kept directly after `slug` |
| `meta_description:` (adventure) | Always | Survives every re-sync once set |
| `month:` (adventure) | Always | Survives every re-sync once set |
| `discussion_url:` / `community_url:` (level) | Always | Website-only fields; never in the challenges repo. Both field aliases are preserved independently |
| `architecture_diagram:` (level) | Always | Auto-fetched from `docs/diagrams/` when present in the challenges repo; otherwise recognised from `src/assets/diagrams/` if the file exists locally |
| `diagram_alt:` (level) | When upstream omits it | If the challenges repo sets `diagram_alt:` explicitly, the upstream value wins |
| `topics:` (level) | When upstream omits them | If the challenges repo sets `topics:` explicitly, the upstream value wins |
| `upcoming_levels:` entries for levels not yet upstream | Always | Placeholders for levels not yet authored in the challenges repo survive re-syncs so "Coming Soon" cards are not dropped |
| All other level content | Never | Steps, objectives, toolbox, services, how_to_play, verification, etc. are always refreshed from the challenges repo |

---

## Adding a New Level to an Already-Merged Adventure

When a new level is ready in the challenges repo after the first adventure PR has already merged:

1. Run the workflow with the same `adventure_url` and set `levels` to the new level ID (e.g. `intermediate`).
2. The workflow detects the adventure already exists in `main` and uses `mode: update`.
3. A new PR is opened on `feat/adventure-<slug>` (the previous PR was merged, so there is no open PR to update).
4. Complete the checklist for the new level only. Adventure-level fields (`contributor`, `community_category_id`, `month`) are already set in `main` and are preserved automatically.

> **Note:** For an existing adventure (`mode: update`), specifying a level that does not yet exist in the challenges repo is an error. The workflow will fail and log the missing level IDs. Wait until the level YAML has been added to the challenges repo, then re-run the sync. This restriction does not apply to new adventures (`mode: create`), where missing levels produce "Coming Soon" placeholders as usual.

---

## Adding a Solution Walkthrough

Solution walkthroughs live in `src/data/solutions/<adventure-id>/<level-id>.ts` and are committed to the repo.

### Use the `/add-solution` skill

The fastest way to add a solution is with the Claude Code skill:

```sh
/add-solution
```

Paste or attach the walkthrough content in any format: markdown, YAML, HTML, or plain text. The skill infers the adventure ID, level ID, and contributor name from the content where possible, confirms them with you, and then:

1. Parses the input into structured steps (`SolutionBlock[]` arrays with text, code, image, and callout blocks).
2. Downloads any referenced images and converts them to WebP at quality 85 using `cwebp`. Images are saved to `public/solutions/<adventure-id>/`.
3. Writes `src/data/solutions/<adventure-id>/<level-id>.ts` with the full typed `Solution` object.
4. Runs `node scripts/generate-solutions.mjs` to rebuild the barrel index and patch region markers.
5. Runs `npm run build` and `npm run lint` to verify the output compiles cleanly.
6. Run `/a11y-audit` against the new solution page to catch any accessibility issues before merging.

### What the generator updates

`scripts/generate-solutions.mjs` scans every `.ts` file in `src/data/solutions/<adventure-id>/` (excluding `index.ts`, `manifest.ts`, and `types.ts`) and rebuilds five files automatically:

| File | What gets patched |
| --- | --- |
| `src/data/solutions/index.ts` | Full barrel re-generated: one import per solution file, exported as `SOLUTIONS: Solution[]`. Never edit by hand. |
| `src/data/solutions/manifest.ts` | Lightweight set of solution IDs regenerated on every run. Used to check solution availability without importing full solution data. Never edit by hand. |
| `react-router.config.ts` | `GENERATED:solutions` region: one prerender entry per solution route (`/adventures/<id>/levels/<level>/solution`). |
| `src/test/seo.test.ts` | `GENERATED:solutions` region: one route entry per solution. |
| `src/test/prerender.test.ts` | `GENERATED:solutions` region: one `{ file, check }` entry per solution asserting the built HTML contains `"Solution"`. |
| `e2e/smoke.spec.ts` | `GENERATED:solutions` region: one `{ path, title }` smoke-test entry per solution. |

You do not need to touch any of these files manually when adding a solution.

### Deadline gating

Solutions are not visible on the site until the challenge deadline has passed. The solution page checks `level.deadline` (falling back to `adventure.rewards.deadline`) and renders a locked state with the deadline date until that moment arrives. Once the deadline passes, the page shows the full walkthrough automatically with no code change needed.

This means you can add a solution file to the repo at any point during the challenge period and it will not spoil anything for active participants.

### Output location

```text
src/data/solutions/<adventure-id>/<level-id>.ts   ← authored TypeScript (commit this)
public/solutions/<adventure-id>/<level-id>-*.webp ← converted images (commit these)
src/data/solutions/index.ts                       ← auto-generated barrel (commit this)
```

---

## Workflows at a Glance

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `sync-adventure.yml` | Manual (`workflow_dispatch`) | Sync adventure content from the challenges repo and open or update a PR |
| `add-discussion-url.yml` | Manual (`workflow_dispatch`) | Set a Discourse thread URL for a level after it has been merged, and open a PR with updated YAML and initial posts |
| `validate-adventures.yml` | PR (when adventure files change) | Validate YAML schema, check generated files are up-to-date, verify route/sitemap/prerender consistency |
| `deploy.yml` | Push to `main` | Build and deploy to GitHub Pages at [offon.dev](https://offon.dev) |
| `preview.yml` | Open PR | Deploy a PR preview at `/pr-preview/pr-<n>/` |
| `refresh-community-data.yml` | Hourly + manual | Refresh discussion posts, leaderboard data, and community leaders from Discourse |
| `refresh-community-sitemap.yml` | Daily (05:00 UTC) + manual | Regenerate and commit the community Discourse sitemap |

---

## Refresh Scripts

These scripts run automatically on the hourly schedule but can also be run locally.

```sh
node scripts/refresh-discussions.mjs   # Fetch discussion posts for each level (no credentials needed)

# The following two scripts require DISCOURSE_API_KEY and DISCOURSE_API_USERNAME in .env
node scripts/refresh-leaderboard.mjs          # Fetch leaderboard data per adventure/level
node scripts/refresh-community-leaders.mjs    # Fetch community leader data
```

Create a `.env` file at the repo root for local use:

```sh
DISCOURSE_API_KEY=your_key_here
DISCOURSE_API_USERNAME=your_username
```

The `.env` file is gitignored. For CI, set `DISCOURSE_API_KEY` and `DISCOURSE_API_USERNAME` as repository secrets in **Settings > Secrets and variables > Actions**.

> The `COMMUNITY_BASE` constant in each refresh script is a necessary duplicate of `COMMUNITY_URL` in `src/data/constants.ts`. The scripts run in Node outside the Vite build and cannot import from `src/`. Always update all five places together if the community URL ever changes: `refresh-discussions.mjs`, `refresh-leaderboard.mjs`, `refresh-community-leaders.mjs`, `generate-community-sitemap.mjs`, and `src/data/constants.ts`.
