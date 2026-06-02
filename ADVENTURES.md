# Adventures

This file is for anyone creating, syncing, or updating an adventure on offon.dev.

Adventures live in a separate repo ([open-source-challenges](https://github.com/off-on-dev/open-source-challenges)) and are pulled into this site via the **Sync Adventure** GitHub Actions workflow. You never write the generated TypeScript files by hand — the workflow and build scripts do that automatically.

---

## How the Content Pipeline Works

```
off-on-dev/open-source-challenges          offon.dev website repo
  adventures/<id>/docs/
    index.yaml          ──── Sync Adventure workflow ────►  src/data/adventures/<slug>/adventure.yaml
    beginner.yaml                                            src/data/adventures/<slug>/<level>-posts.json
    intermediate.yaml   ──── npm run generate (prebuild) ──►  <slug>.generated.ts
    ...                                                       src/data/adventures/index.ts
                                                              src/data/adventures/summaries.ts
```

The generated TypeScript files are committed so the dev server works without running the generator manually. Never edit `*.generated.ts`, `index.ts`, or `summaries.ts` by hand.

---

## Syncing a New Adventure

### 1. Trigger the workflow

Go to **Actions → Sync Adventure from Challenges Repo → Run workflow**.

| Input | Required | Description |
|---|---|---|
| `adventure_url` | Yes | URL of the adventure folder in the challenges repo. Example: `https://github.com/off-on-dev/open-source-challenges/tree/main/adventures/05-lex-imperfecta` |
| `levels` | No | Comma-separated level IDs to make live now (e.g. `beginner` or `beginner,intermediate`). Levels that exist in the challenges repo but are not listed here appear as "Coming Soon" placeholders. Leave blank to make all levels live. |

### 2. What the workflow does

1. Validates the URL points to `off-on-dev/open-source-challenges`.
2. If a PR branch (`feat/adventure-<slug>`) already exists, restores `adventure.yaml` from that branch so any manual edits already made survive the re-sync.
3. Fetches `docs/index.yaml` and all level YAMLs from the challenges repo.
4. Writes `src/data/adventures/<slug>/adventure.yaml` and creates `<level>-posts.json` stubs for each new live level.
5. Runs `generate-adventures.mjs` to regenerate all TypeScript, sitemap entries, prerender entries, and test arrays.
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

Change `rewards.deadline:` from `TODO` to a real ISO 8601 datetime: e.g. `2026-07-01T23:59:00+01:00`.

### Review topics

Each level's `topics:` list defaults to all adventure tags. Refine it to the subset of technologies that are actually used in that level. This list is preserved on re-sync only if the challenges repo did not set it explicitly (see Re-syncing below).

### Update discussion_url

Once you have created the Discourse thread for a level, use the **Add Discussion URL to Level** workflow (Actions tab → Add Discussion URL to Level → Run workflow).

| Input | Description |
|---|---|
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

### Final checks

```sh
npm run lint && npm test && npm run build && npm run test:e2e
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
|---|---|---|
| `contributor:` (adventure) | Always | Survives every re-sync once set |
| `community_category_id:` (adventure) | Always | Survives every re-sync once set |
| `month:` (adventure) | Always | Survives every re-sync once set |
| `discussion_url:` (level) | Always | Website-only field; never in the challenges repo |
| `architecture_diagram:` (level) | Always | Stripped from incoming; preserved once added manually |
| `topics:` (level) | Only if challenges repo did not set them | If the challenges repo sets `topics:` explicitly, the upstream value wins |
| All other level content | Never | Steps, objectives, toolbox, services, how_to_play, verification, etc. are always refreshed from the challenges repo |

---

## Adding a New Level to an Already-Merged Adventure

When a new level is ready in the challenges repo after the first adventure PR has already merged:

1. Run the workflow with the same `adventure_url` and set `levels` to the new level ID (e.g. `intermediate`).
2. The workflow detects the adventure already exists in `main` and uses `mode: update`.
3. A new PR is opened on `feat/adventure-<slug>` (the previous PR was merged, so there is no open PR to update).
4. Complete the checklist for the new level only. Adventure-level fields (`contributor`, `community_category_id`, `month`) are already set in `main` and are preserved automatically.

---

## Workflows at a Glance

| Workflow | Trigger | Purpose |
|---|---|---|
| `sync-adventure.yml` | Manual (`workflow_dispatch`) | Sync adventure content from the challenges repo and open or update a PR |
| `add-discussion-url.yml` | Manual (`workflow_dispatch`) | Set a Discourse thread URL for a level after it has been merged, and open a PR with updated YAML and initial posts |
| `validate-adventures.yml` | PR (when adventure files change) | Validate YAML schema, check generated files are up-to-date, verify route/sitemap/prerender consistency |
| `deploy.yml` | Push to `main` | Build and deploy to GitHub Pages at https://offon.dev |
| `preview.yml` | Open PR | Deploy a PR preview at `/pr-preview/pr-<n>/` |
| `refresh-community-data.yml` | Hourly + manual | Refresh discussion posts, leaderboard data, and community leaders from Discourse |

---

## Refresh Scripts

These scripts run automatically on the hourly schedule but can also be run locally.

```sh
# Requires DISCOURSE_API_KEY and DISCOURSE_API_USERNAME in .env
node scripts/refresh-discussions.mjs   # Fetch discussion posts for each level
node scripts/refresh-leaderboard.mjs   # Fetch leaderboard data per adventure/level
node scripts/refresh-community-leaders.mjs  # Fetch community leader data
```

Create a `.env` file at the repo root for local use:

```sh
DISCOURSE_API_KEY=your_key_here
DISCOURSE_API_USERNAME=your_username
```

The `.env` file is gitignored. For CI, set `DISCOURSE_API_KEY` and `DISCOURSE_API_USERNAME` as repository secrets in **Settings > Secrets and variables > Actions**.

> The `COMMUNITY_BASE` constant in each refresh script is a necessary duplicate of `COMMUNITY_URL` in `src/data/constants.ts`. The scripts run in Node outside the Vite build and cannot import from `src/`. Always update all four places together if the community URL ever changes.
