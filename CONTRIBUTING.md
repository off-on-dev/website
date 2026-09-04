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

### If the e2e suite fails in a way that makes no sense

**Check free memory before checking your diff.** `npm run test:e2e` runs 8 parallel
workers, each with its own browser, and the whole thing is memory-hungry. On a
machine already running an editor, Chrome and a few Electron apps it can exhaust
memory, at which point the OS starts killing processes — usually the static server
that serves `dist/`. Playwright then reports whatever each test happened to be
doing, so you get a failure set that looks alarming and unrelated to your change.

Symptoms that mean "out of memory", not "regression":

- a **different set of tests** fails on each run
- `net::ERR_CONNECTION_REFUSED`
- an assertion on page content where the received value is empty (`Received: ""`)
- `Killed: 9` from the runner itself
- unexplained timeouts in `mobile-menu.spec.ts` or the 200% zoom block

What to do: check `PhysMem` in `top -l 1 -n 0`. Under roughly 2G free, close
applications or re-run with `--workers=2`. Confirm against a build of `main`
under the same conditions before concluding anything about your branch. CI is
unaffected — it shards across three dedicated runners.

## Visual regression

`e2e/visual.spec.ts` compares 24 full-page screenshots (12 routes × 2 themes, desktop only) against committed baselines in `e2e/snapshots/`. **This is not a CI gate.** Run it locally before and after a visual change to catch regressions or confirm an intentional change looks correct.

**Desktop only.** Mobile was removed because headless Chromium's text rasterisation is non-deterministic on long mobile captures (375 px viewport, pages up to 12 000 px tall): different pixels fail on every run regardless of tolerance, making the suite unreliable as a signal. Mobile layout changes must be checked by eye against the production build (`npm run preview`) at 375 px, 768 px, and 1280 px.

### Two commands

```sh
npm run test:visual      # compare current build against committed baselines
npm run baselines:update # regenerate baselines (after an intentional visual change)
```

Both commands run natively using your local Playwright installation. No Docker required.

### Platform note

The committed baselines in `e2e/snapshots/` are generated on macOS using CoreText font rendering. **This is a deliberate tradeoff, not an oversight** — VRT is a local-only check and CI never runs it, so there is no shared environment to target. The consequence: if you are on Linux or Windows, Chromium's font stack differs (FreeType vs. DirectWrite vs. CoreText) and the comparison will fail on text-heavy regions even when the layout is identical. Before `test:visual` is meaningful on a non-macOS machine, regenerate baselines for your platform with `npm run baselines:update`, but do not commit them — the macOS baselines are the shared reference.

### When to regenerate baselines

- After an intentional visual change (layout, colour, component).
- After adding a new route to `e2e/visual.spec.ts` (the comparison fails with "missing snapshot" until a baseline exists for that route).
- After bumping `@playwright/test`: run `npm run baselines:update` to regenerate with the new Playwright version.

After regenerating, commit the updated files in `e2e/snapshots/` alongside the visual change. Run `npm run test:visual` once more after committing to confirm zero diff.

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

Full rules are in [AGENTS.md](AGENTS.md) and [styleguide.md](styleguide.md). Claude Code users get `AGENTS.md` automatically: `CLAUDE.md` imports it.

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
