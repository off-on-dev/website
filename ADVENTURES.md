# Adventures

This file is for anyone creating, syncing, or updating an adventure on offon.dev.

Adventures live in a separate repo ([open-source-challenges](https://github.com/off-on-dev/open-source-challenges)) and are pulled into this site via the **Sync Adventure** GitHub Actions workflow. You never write the generated TypeScript files by hand — the workflow and build scripts do that automatically.

---

## How the Content Pipeline Works

```text
off-on-dev/open-source-challenges          offon.dev website repo
  adventures/<id>/docs/
    index.yaml          ──── Sync Adventure workflow ────►  src/data/adventures/<slug>/adventure.yaml
    beginner.yaml                                            src/data/adventures/<slug>/<level>-posts.json
    intermediate.yaml   ──── npm run generate (prebuild) ──►  src/data/adventures/<slug>.generated.ts
    ...                                                       src/data/adventures/index.ts
                                                              src/data/adventures/summaries.ts
```

The generated TypeScript files are committed so the dev server works without running the generator manually. Never edit `*.generated.ts`, `index.ts`, or `summaries.ts` by hand.

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
5. Runs `generate-adventures.mjs` to regenerate all TypeScript, sitemap entries, prerender entries, test arrays, `public/llms.txt`, and the leaderboard adventure list in `scripts/refresh-leaderboard.mjs`.
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
```

Add this to `src/data/adventures/<slug>/adventure.yaml`. The `url` and `about` fields are optional but recommended. Once set, this block survives future re-syncs automatically.

### Confirm month

The `month:` field defaults to the current month when first synced. Correct it if the adventure is planned for a future release. Format: `MMM YYYY` (e.g. `JAN 2026`). This field also survives re-syncs once set.

### Set community_category_id

1. Look up the Discourse category at `https://community.offon.dev/categories.json`.
2. Find the category for this adventure and copy its `id` integer.
3. Add `community_category_id: <id>` to `adventure.yaml`.
4. Run `npm run generate` to regenerate TypeScript.

This field also survives future re-syncs once set.

### Update rewards deadline

Change `rewards.deadline:` from `TODO` to either an ISO 8601 datetime or the human-readable format used in the challenges repo:

```yaml
# ISO 8601 (preferred for direct edits)
rewards.deadline: "2026-07-01T23:59:00+01:00"

# Human-readable (accepted; the generator converts it automatically)
rewards.deadline: "Tuesday, 1 July 2026 at 23:59 CET"
```

Supported timezone abbreviations: `CET` (+01:00), `CEST` (+02:00), `UTC` (+00:00), `GMT` (+00:00). Unrecognised abbreviations are left as-is and logged as warnings during generation.

### Review topics

Each level's `topics:` list defaults to all adventure tags. Refine it to the subset of technologies that are actually used in that level. This list is preserved on re-sync only if the challenges repo did not set it explicitly (see Re-syncing below).

### Update discussion_url

Once you have created the Discourse thread for a level, use the **Add Discussion URL to Level** workflow (Actions tab → Add Discussion URL to Level → Run workflow).

| Input | Description |
| --- | --- |
| `adventure_id` | Adventure slug, e.g. `lex-imperfecta` |
| `level_id` | `beginner`, `intermediate`, or `expert` |
| `discussion_url` | Full Discourse thread URL, e.g. `https://community.offon.dev/t/slug/1419` |

The workflow updates `discussion_url` in `adventure.yaml`, fetches the initial posts from Discourse, regenerates TypeScript, and opens a PR. Run it once per level. If the thread is brand-new and has no posts yet, the PR will contain an empty `discussionPosts` array; the hourly `refresh-community-data` workflow will populate it once posts appear.

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

`generate-adventures.mjs` cross-checks each level's `devcontainer:` value against the actual folder names in [`off-on-dev/open-source-challenges/.devcontainer`](https://github.com/off-on-dev/open-source-challenges/tree/main/.devcontainer) via `gh api`.

**In generate mode** (the default, including the sync workflow): if a value is wrong but an unambiguous match can be found by slug and difficulty, the YAML is patched in place and a warning is printed:

```text
Warning: <slug> levels[0]: devcontainer auto-corrected "<wrong>" → "<correct>" — update adventure.yaml in the challenges repo
```

If you see this warning, also fix the `devcontainer:` value upstream in the challenges repo so the next sync does not reintroduce the wrong value.

**In `--validate-only` mode** (`npm run generate:validate`, used by CI): wrong values are always hard errors with no auto-correction.

If `gh` is unavailable or unauthenticated, the check is skipped with a warning and generation proceeds.

### Verify llms.txt

`generate-adventures.mjs` automatically patches the adventure entry in `public/llms.txt`. After running `npm run generate`, confirm the adventure appears correctly in the file under the Adventures section with the right title and URL.

### Run the a11y audit

After the build passes, run the accessibility audit against any new or changed pages:

```sh
/a11y-audit
```

Target any new adventure or level detail pages. All severity-weighted findings must be resolved before merging.

### Final checks

```sh
npm run lint && npm run lint:reuse && npm test && npm run build && npm run test:e2e
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
