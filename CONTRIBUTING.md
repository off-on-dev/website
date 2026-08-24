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
