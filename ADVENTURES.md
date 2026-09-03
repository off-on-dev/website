# Adventures

This file is for anyone creating, syncing, or updating an adventure on offon.dev.

Adventures live in a separate repo ([open-source-challenges](https://github.com/off-on-dev/open-source-challenges)) and are pulled into this site via the **Sync Adventure** GitHub Actions workflow.

Since the Astro migration there is **no code generation step**. Astro reads `adventure.yaml` directly through a Zod-validated content collection (`src/content.config.ts`) and renders the markdown prose to HTML at build time. Routes appear automatically via `getStaticPaths()`. The source of truth is the YAML; there are no `*.generated.ts` files.

> **Slug constraint:** The `slug` field in `adventure.yaml` must exactly match the adventure directory name under `src/data/adventures/`. The content loader asserts this at build time. If they diverge, the build fails with a clear message. When renaming a directory, update the YAML `slug` field to match (or vice versa).

---

## How the Content Pipeline Works

```text
off-on-dev/open-source-challenges          offon.dev website repo
  adventures/<id>/docs/
    index.yaml          ──── Sync Adventure workflow ────►  src/data/adventures/<slug>/adventure.yaml
    beginner.yaml                                            src/data/adventures/<slug>/<level>-posts.json
    intermediate.yaml
    ...
                        (build time) content collection ──►  routes + rendered HTML (getStaticPaths)
```

Validate the YAML any time with `npm run sync` (runs the Zod schema; the build also fails on invalid content).

---

## adventure.yaml Field Reference

The authoritative schema is in [`src/content.config.ts`](src/content.config.ts) (Zod `.strict()` — unknown fields fail the build). This table is derived from it; when the two diverge, the code wins.

### Top-level (adventure) fields

| Field | Status | Type / Constraint | Notes |
| --- | --- | --- | --- |
| `slug` | **Required** | `[a-z0-9][a-z0-9-]*[a-z0-9]` | Must match the directory name under `src/data/adventures/`. Build fails on mismatch. |
| `title` or `name` | **One required** | string | `title` for icon-based adventures; `name` for emoji-based. At least one must be set. |
| `icon` | Optional | Lucide icon name (e.g. `Satellite`) | The sync workflow auto-registers the icon (imports, type union, emoji mapping) and writes `icon:` directly into `adventure.yaml`. Set explicitly in the challenges repo when the emoji alone is insufficient. |
| `emoji` | Optional | emoji character | Shown on the adventure card. The sync workflow maps it to a Lucide icon via the `EMOJI_TO_ICON` table; add the mapping there first if the emoji is new. |
| `month` | **Required** | `MMM YYYY` | Three-letter uppercase abbreviation + four-digit year. Allowed: `JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC`. Validated by Zod regex; wrong format fails sync. |
| `tags` | **Required** | `string[]` (min 1) | Technology/topic labels shown as filter chips. Used when the auto-generated `meta_description` falls back to name + backstory. |
| `meta_description` | **Required** | string, max 160 chars | Validated by the Zod schema; missing field fails `npm run sync`. Max 160 chars. No em dashes; no ` - ` used as a dash. |
| `story` | Optional | markdown string | Short description shown on adventure cards and at the top of the adventure page. Card views strip HTML; set:html prose uses the rendered version. |
| `backstory` | Optional | `string[]` (markdown) | Thematic narrative paragraphs rendered on the adventure page. |
| `overview` | Optional | `string[]` (markdown) | Technical/content summary rendered on the adventure page. |
| `contributor` | Optional | object | `name` (required), `url` (optional URL), `about` (optional markdown), `discourse_username` (optional string -- Discourse username used for avatar resolution in community leaderboards). Survives every re-sync once set. |
| `community_category_id` | Optional | integer | Discourse category ID. Survives every re-sync once set; position is kept directly after `slug`. |
| `rewards` | Optional | object | `deadline` (required inside; see format below), `eligibility` (markdown), `tiers` (array of `{label, description}`), `ranking_note` (markdown), `ranking_rules_url` (URL). |
| `upcoming_levels` | Optional | object[] | Coming-soon placeholders: `{level?, name, difficulty}`. Survives re-syncs for levels not yet in the challenges repo. |
| `levels` | **Required** | object[] (min 1) | See level fields below. |

**`rewards.deadline` format and timezone handling.** Preferred: ISO 8601 (`"2026-07-01T23:59:00+01:00"`). Also accepted: `"Weekday, D Month YYYY at HH:MM TZ"` (e.g. `"Tuesday, 1 July 2026 at 23:59 CET"`). Supported timezone abbreviations: `CET` (+01:00), `CEST` (+02:00), `UTC` (+00:00), `GMT` (+00:00). Unrecognised abbreviations are left as-is and logged as warnings. The string `"TODO"` is accepted and renders as an empty deadline (no gating).

### Level fields

Each entry in the `levels` array accepts the following fields.

| Field | Status | Type / Constraint | Notes |
| --- | --- | --- | --- |
| `level` | **Required** | string | Level identifier and URL segment: `beginner`, `intermediate`, or `expert`. |
| `name` or `title` | **One required** | string | Display name for the level. |
| `devcontainer` | **Required** | string | Devcontainer folder name in the challenges repo `.devcontainer/` directory. |
| `topics` | **Required** | `string[]` | Technologies covered by this level. An empty `[]` is valid and stays empty; inheriting adventure `tags` is done by the sync workflow, not the schema. |
| `objective` | **Required** | `string[]` (markdown) | Success criteria list shown to participants. |
| `toolbox` | **Required** | object[] | `{name, description, url?}` — tools available in the level environment. |
| `how_to_play` | **Required** | object[] | `{id?, title, content}` — ordered step-by-step instructions. |
| `emoji` | Optional | `🟢` / `🟡` / `🔴` | Difficulty emoji. |
| `difficulty` | Optional | `Beginner` \| `Intermediate` \| `Expert` | Inferred from `emoji` when absent. |
| `community_url` | Optional | URL string | Discourse thread URL for this level. Website-only; never overwritten by re-syncs. |
| `discussion_url` | Optional | URL string | Deprecated alias for `community_url`; preserved independently on re-sync. |
| `deadline` | Optional | ISO 8601 or human-readable | Level-specific deadline. Overrides `rewards.deadline` for solution page gating. Same format rules as `rewards.deadline` above. |
| `summary` | Optional | string | One-sentence summary for card views (plain text; not markdown). |
| `intro` | Optional | `string[]` (markdown) | Opening paragraphs shown below the level heading. |
| `backstory` | Optional | `string[]` (markdown) | Level-specific narrative paragraphs. |
| `architecture` | Optional | `string[]` (markdown) | Architecture description paragraphs. |
| `architecture_diagram` | Optional | SVG filename | Filename only (e.g. `echoes-beginner.svg`) in `src/assets/diagrams/`. Add the SVG manually; the sync workflow strips this field from incoming content. Survives re-syncs once set manually. |
| `diagram_alt` | Optional | string | Alt text for the architecture diagram image. |
| `architecture_ascii` | Optional | string | ASCII art fallback for environments that cannot render SVG. |
| `audience` | Optional | string (markdown) | Description of who the level is aimed at. |
| `estimated_time` | Optional | string | Human-readable time estimate (e.g. `"2–4 hours"`). |
| `scenario` | Optional | string (markdown) | Scenario prose shown before the how-to-play steps. |
| `services` | Optional | object[] | Services exposed by the devcontainer: `{name, port?, url?, credentials?, description, internal?}`. Use `port` for a bare port number or `url` for a full URL (e.g. `http://localhost:5173`). An injected "Explore the UIs" step is generated automatically when at least one non-internal service has a `port` or `url`. |
| `helpful_links` | Optional | object[] | Reference links shown at the bottom of the level: `{title, url, description?}`. |
| `meta_description` | Optional | string, max 160 chars | Level-specific meta description. When absent, the generator builds one from `name`/`title` + `intro[0]` + difficulty + topics. |
| `what_you_learn` or `learnings` | **One required** | `string[]` (min 1 when present) | Learning objectives list. A Zod `.refine()` requires at least one of the two to be set; if both are absent the build fails. |
| `verification` | **Required** | object | `{command, description}` — the verification gate command and its description. |
| `codespaces_machine` | Optional | `"4core"` | Machine size override for Codespaces. Only `"4core"` is accepted; other values fail the Zod schema. |
| `hook` | Optional | string | Verification hook command. |
| `contributor` | Optional | object | Person who built this specific level (may differ from the adventure proposer). Same subfields as the adventure `contributor` (`name`, `url`, `about`, `discourse_username`). When set, takes precedence over the adventure contributor for credit display on the level page and in community leaderboard sections. |
| `solved_count` | Optional | integer | Override for the displayed solved count. |
| `top_players` | Optional | object[] | System-populated leaderboard data: `{username, count}`. Set by the leaderboard refresh script; do not edit by hand. |

---

## Syncing a New Adventure

### 1. Trigger the workflow

Go to **Actions → Sync Adventure from Challenges Repo → Run workflow**.

| Input | Required | Description |
| --- | --- | --- |
| `adventure_url` | Yes | GitHub URL of the adventure folder — any branch works. Main: `https://github.com/off-on-dev/open-source-challenges/tree/main/adventures/05-lex-imperfecta`. PR branch: `https://github.com/off-on-dev/open-source-challenges/tree/feat/my-branch/adventures/05-lex-imperfecta`. |
| `levels` | No | Comma-separated level IDs to make live now (e.g. `beginner` or `beginner,intermediate`). Levels that exist in the challenges repo but are not listed here appear as "Coming Soon" placeholders. Leave blank to make all levels live. |

### 2. What the workflow does

1. Validates the URL points to `off-on-dev/open-source-challenges`.
2. If a PR branch (`feat/adventure-<slug>`) already exists, restores `adventure.yaml` from that branch so any manual edits already made survive the re-sync.
3. Fetches `docs/index.yaml` and all level YAMLs from the challenges repo.
4. Writes `src/data/adventures/<slug>/adventure.yaml` and creates `<level>-posts.json` stubs for each new live level.
5. Validates the YAML with `astro sync` (Zod content schema) and registers the adventure in `ADVENTURE_CATEGORIES` (`scripts/refresh-leaderboard.mjs`). Routes and sitemap entries are automatic via `getStaticPaths()` and `src/pages/sitemap.xml.ts`. `public/llms.txt` is updated by hand as part of the PR checklist.
6. Opens (or updates) a PR on `feat/adventure-<slug>` with a checklist of steps to complete before merging.

---

## Completing the PR Checklist

The PR body lists everything that needs to happen before merging. Here is each item explained.

### Add contributor block

```yaml
contributor:
  name: "Full Name"
  url: "https://example.com"
  about: "One sentence bio."
  discourse_username: "their_forum_username"
```

Add this to `src/data/adventures/<slug>/adventure.yaml`. The `url`, `about`, and `discourse_username` fields are optional but recommended -- `discourse_username` enables avatar resolution in community leaderboards. Once set, this block survives future re-syncs automatically.

### Confirm month

The `month:` field defaults to the current month when first synced. Correct it if the adventure is planned for a future release. Format: `MMM YYYY` (e.g. `JAN 2026`). This field also survives re-syncs once set.

### Set community_category_id

1. Look up the Discourse category at `https://community.offon.dev/categories.json`.
2. Find the category for this adventure and copy its `id` integer.
3. Add `community_category_id: <id>` to `adventure.yaml`.
4. Run `npm run sync` to validate the YAML against the content schema.

This field also survives future re-syncs once set.

### Update rewards deadline

Change `rewards.deadline:` from `TODO` to either an ISO 8601 datetime or the human-readable format used in the challenges repo:

```yaml
# ISO 8601 (preferred for direct edits)
rewards.deadline: "2026-07-01T23:59:00+01:00"

# Human-readable (accepted; the generator converts it automatically)
rewards.deadline: "Tuesday, 1 July 2026 at 23:59 CET"
```

See the `rewards.deadline` entry in the [Field Reference](#adventureyaml-field-reference) above for the full format and supported timezone abbreviations.

### Review topics

Each level's `topics:` list is set by the sync workflow to the adventure's full `tags` list if the challenges repo does not set it explicitly. Refine it to the subset of technologies actually used in that level. This list is preserved on re-sync only if the challenges repo did not set it explicitly (see Re-syncing below).

### Update discussion_url

Once you have created the Discourse thread for a level, use the **Add Discussion URL to Level** workflow (Actions tab → Add Discussion URL to Level → Run workflow).

| Input | Description |
| --- | --- |
| `adventure_id` | Adventure slug, e.g. `lex-imperfecta` |
| `level_id` | `beginner`, `intermediate`, or `expert` |
| `discussion_url` | Full Discourse thread URL, e.g. `https://community.offon.dev/t/slug/1419` |

The workflow updates `discussion_url` in `adventure.yaml`, fetches the initial posts from Discourse into `[level]-posts.json`, and opens a PR. Run it once per level. If the thread is brand-new and has no posts yet, the PR will contain an empty `discussionPosts` array; the hourly `refresh-community-data` workflow will populate it once posts appear.

`discussion_url` in `adventure.yaml` is a website-only field. It is never in the challenges repo and survives every re-sync automatically.

### Add architecture diagrams (if needed)

If a level has an SVG architecture diagram, the sync strips the `architecture_diagram:` field because the SVG file must be added to `src/assets/diagrams/` manually.

1. Add the SVG file to `src/assets/diagrams/<filename>.svg`.
2. Add `architecture_diagram: <filename>.svg` back to the level in `adventure.yaml`.

Once set, `architecture_diagram` survives future re-syncs automatically.

### Run the leaderboard script

```sh
node scripts/refresh-leaderboard.mjs
```

Run this after `community_category_id` is set. It adds the adventure to the leaderboard data used on the site. Requires `DISCOURSE_API_KEY` and `DISCOURSE_API_USERNAME` in your environment or a `.env` file.

### Verify devcontainer paths

Devcontainer path verification is handled automatically by the `sync-adventure` workflow during import. If a `devcontainer:` value in the YAML does not match a folder in the challenges repo's `.devcontainer` directory, the workflow logs a warning in its output. If you see such a warning, update the `devcontainer:` value in `adventure.yaml` to match the correct folder name, and also fix the value upstream in the challenges repo so the next sync does not reintroduce the wrong value.

### Verify llms.txt

Add the new adventure entry to `public/llms.txt` by hand, following the format of the existing entries in the Adventures section. Add the adventure URL and a one-sentence description. Once levels are published, add per-level URLs as sub-bullets.

### Run the a11y audit

After the build passes, run the accessibility audit against any new or changed pages:

```sh
/a11y-audit
```

Target any new adventure or level detail pages. All severity-weighted findings must be resolved before merging.

### Final checks

```sh
npm run sync && npm run lint:reuse && npm run build && npm run test:e2e
```

All checks must pass before merging.

---

## Re-syncing an Open PR

If the challenges repo is updated while your PR is still open, or you want to promote a "Coming Soon" level to live, just run the workflow again with the same (or updated) inputs. You do not need to close or recreate the PR.

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
| `month:` (adventure) | Always | Survives every re-sync once set |
| `discussion_url:` / `community_url:` (level) | Always | Website-only fields; never in the challenges repo. Both field aliases are preserved independently |
| `architecture_diagram:` (level) | Always | Stripped from incoming; preserved once added manually |
| `topics:` (level) | Only if challenges repo did not set them | If the challenges repo sets `topics:` explicitly, the upstream value wins |
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

Paste or attach the walkthrough content in any format — markdown, YAML, HTML, or plain text. The skill infers the adventure ID, level ID, and contributor name from the content where possible, confirms them with you, and then:

1. Parses the input into structured steps (`SolutionBlock[]` arrays with text, code, image, and callout blocks).
2. Downloads any referenced images and converts them to WebP at quality 85 using `cwebp`. Images are saved to `public/solutions/<adventure-id>/`.
3. Writes `src/data/solutions/<adventure-id>/<level-id>.ts` with the full typed `Solution` object.
4. Runs `npm run build` to verify the output compiles cleanly.
5. Run `/a11y-audit` against the new solution page to catch any accessibility issues before merging.

### How solutions are loaded

There is no solutions generator. `src/lib/solutions.ts` loads every `src/data/solutions/<adventure-id>/<level-id>.ts` via `import.meta.glob` at build time, and the solution route (`/adventures/<id>/levels/<level>/solution/`) is generated by `getStaticPaths()`. Just add the `.ts` file — no barrel or region markers to update. Add the route to the test lists in `e2e/smoke.spec.ts` and `e2e/a11y.spec.ts`.

### Deadline gating

Solutions are not visible on the site until the challenge deadline has passed. The solution page checks `level.deadline` (falling back to `adventure.rewards.deadline`) and renders a locked state with the deadline date until that moment arrives. Once the deadline passes, the page shows the full walkthrough automatically with no code change needed.

This means you can add a solution file to the repo at any point during the challenge period and it will not spoil anything for active participants.

### Output location

```text
src/data/solutions/<adventure-id>/<level-id>.ts   ← authored TypeScript (commit this)
public/solutions/<adventure-id>/<level-id>-*.webp ← converted images (commit these)
```

---

## Workflows at a Glance

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `sync-adventure.yml` | Manual (`workflow_dispatch`) | Sync adventure content from the challenges repo and open or update a PR |
| `add-discussion-url.yml` | Manual (`workflow_dispatch`) | Set a Discourse thread URL for a level after it has been merged, and open a PR with updated YAML and initial posts |
| `validate-adventures.yml` | PR (when adventure files change) | Validate adventure YAML against the Zod content schema (`astro sync`), check per-level discussion JSON exists, verify `ADVENTURE_CATEGORIES` registration |
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

> The `COMMUNITY_BASE` constant in each refresh script is a necessary duplicate of `COMMUNITY_URL` in `src/lib/site.ts`. The scripts run in Node outside the Vite build and cannot import from `src/`. Always update all five places together if the community URL ever changes: `refresh-discussions.mjs`, `refresh-leaderboard.mjs`, `refresh-community-leaders.mjs`, `generate-community-sitemap.mjs`, and `src/lib/site.ts`.
