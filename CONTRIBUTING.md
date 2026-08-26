# Contributing to offon.dev

Thanks for your interest in contributing. This guide covers everything you need to get started.

---

## Prerequisites

- **Node.js 26** (pinned in `.nvmrc`). Run `nvm use` to switch automatically.
- No backend setup required. The site is fully static.

## Local setup

1. Fork the repo on GitHub, then clone your fork:

```sh
git clone https://github.com/<your-username>/website.git
cd website
nvm use
npm install
npm run dev        # http://localhost:4321
```

1. Add the upstream remote so you can pull in future changes:

```sh
git remote add upstream https://github.com/off-on-dev/website.git
```

Open PRs from your fork against `main` on the upstream repo.

## Running checks

```sh
npm run lint             # ESLint
npm run lint:reuse       # REUSE licence compliance (requires: pip install reuse)
npm run test:unit        # Vitest unit tests
npm run build && npm run test:e2e  # Playwright smoke, SSG, a11y, and hydration tests
```

All four must pass with zero failures before opening a PR.

## Visual regression baselines

`e2e/visual.spec.ts` compares 48 full-page screenshots (12 routes × 2 viewports × 2 themes) against committed baselines in `e2e/snapshots/`. A missing or mismatched baseline fails CI.

**Baselines must be generated on linux only.** macOS and Windows use different font renderers (CoreText / DirectWrite vs FreeType) that produce pixel-level differences even for identical HTML, breaking the comparison on CI.

### Regenerating baselines

Two equivalent routes — use whichever suits your setup:

**Option A — local Docker (requires Docker Desktop or Colima):**

```sh
npm run baselines:update
```

This runs the exact Playwright Docker image used as the reference. The image tag in `package.json` (`mcr.microsoft.com/playwright:v<version>-noble`) **must be kept in sync with the `@playwright/test` version in `package-lock.json`**. When you bump Playwright, bump the image tag in the same commit.

**Option B — GitHub Actions (no local Docker needed):**

1. Push your branch.
2. Go to **Actions → Regenerate visual baselines → Run workflow** and select your branch.
3. The workflow commits updated baselines back to the branch.
4. Re-trigger the PR e2e job (push a follow-up commit or re-run it manually) to confirm CI passes.

### When to regenerate

- After an intentional visual change (layout, colour, component).
- After adding a new route to `e2e/visual.spec.ts` (CI fails with "missing snapshot" until baselines exist).
- After bumping `@playwright/test` (the Docker image and workflow use the same Chromium version; mismatches produce spurious diffs).

## Conventions

**Branch naming:** `type/short-description` (e.g. `feat/hero-section`, `fix/nav-scroll`)

**Commit types:** `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `perf`, `security`, `config`, `revert`

**Commit sign-off:** Every commit must include a sign-off:

```sh
git commit -s -m "feat: add contributor badge"
```

**PR titles** follow the same conventional commit format: `feat: ...`, `fix: ...`, etc.

## Code style

- TypeScript with explicit return types on all functions and components.
- Tailwind utility classes directly on elements. No inline styles.
- Both light and dark mode must work for every UI change.
- Inline links in prose need `{" "}` around them. Astro strips the whitespace
  between text and an adjacent element when the source has a newline there, so
  `See our\n<a>Privacy Policy</a>\nfor details.` renders with no spaces. See
  [styleguide.md](styleguide.md) for the detail.

### Interactive components

- Default to a `.astro` component with a plain `<script>`. Reach for a framework
  only when the component has genuinely reactive state that a class toggle and a
  small script cannot express.
- **When one is warranted, use Vue. Never React.** The `@astrojs/vue`
  integration stays installed even though nothing currently uses it, so adding
  an island is a one-file change. Do not remove the Vue packages as "unused".
- The site currently ships zero islands. The theme toggle, mobile drawer,
  consent banner, starter nudge and challenge filter were all islands once and
  are now markup plus a script; they are the bar for what does *not* justify a
  framework.

Full rules are in [AGENTS.md](AGENTS.md) (or [CLAUDE.md](CLAUDE.md) for Claude Code users) and [styleguide.md](styleguide.md).

## AI assistance

The project guidelines in [AGENTS.md](AGENTS.md) work with any AI assistant. Paste it as a system prompt or load it into your tool's context before starting work.

Workflow-specific AI prompts live in [`.claude/commands/`](.claude/commands/). Paste the relevant file into your AI assistant as a system prompt or opening message. The YAML frontmatter block at the top is harmless and can be ignored.

| Prompt | When to use |
| --- | --- |
| `add-solution.md` | Adding a solution walkthrough |
| `create-presentation.md` | Creating a Reveal.js or PowerPoint deck |
| `a11y-audit.md` | Accessibility audit of a component or page |
| `keyboard.md` | Reviewing interactive element keyboard behaviour |
| `navigation.md` | Reviewing nav components |
| `progressive-enhancement.md` | Ensuring core content works without JS |
| `user-personalization.md` | Reviewing theme or consent state changes |

**Claude Code users:** these are available as slash commands (`/add-solution`, `/create-presentation`, `/a11y-audit`, etc.) — you do not need to paste them manually.

## Accessibility

Every component must meet WCAG 2.2 AA. Read [ACCESSIBILITY.md](ACCESSIBILITY.md) before writing or modifying any component. The axe audit runs automatically on every PR.

## Adventure content

Adventures are authored as YAML. The YAML is the source of truth; there are no generated files to commit or maintain. See [ADVENTURES.md](ADVENTURES.md) for the full content pipeline.

## Need help?

Open an issue or start a discussion on [community.offon.dev](https://community.offon.dev).
