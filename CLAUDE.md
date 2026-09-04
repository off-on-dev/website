# CLAUDE.md

@AGENTS.md

Claude Code reads this file, not `AGENTS.md`. The line above imports
[`AGENTS.md`](AGENTS.md), which holds the project guidelines. Add guidance there, not
here.

Only Claude-specific content belongs in this file. Today that is the slash-command
table below.

---

## Project Commands

Project-level Claude Code commands live in `.claude/commands/`. Invoke them with
`/command-name`. These are committed to the repo and available to all contributors.
Other AI tools can use the same files as prompts; see "AI Prompts for Contributors"
in [`AGENTS.md`](AGENTS.md).

| Command | When to use |
| --- | --- |
| `/a11y-audit` | On-demand accessibility audit using the Red Team / Blue Team persona pipeline. Run against a component or page to get a severity-weighted report. Invokes sub-commands below as needed. |
| &nbsp;&nbsp;`/keyboard` | Sub-command: writing or reviewing any interactive element, such as buttons, modals, dropdowns, tabs, custom widgets. |
| &nbsp;&nbsp;`/navigation` | Sub-command: working on nav components, such as primary nav, skip links, breadcrumbs, pagination, mobile menus. |
| &nbsp;&nbsp;`/progressive-enhancement` | Sub-command: building any new feature or reviewing architecture. Ensures core content works without JS. |
| &nbsp;&nbsp;`/user-personalization` | Sub-command: working on theme toggle, consent state, or any user preference persistence. |
| `/add-solution` | Generate a structured TypeScript solution file (`src/data/solutions/<id>/<level>.ts`) from any input format. Downloads and converts images to WebP. Solutions are pre-built TS objects loaded by the app; there is no generator step. |
| `/create-presentation` | Create a presentation deck for an OffOn event or challenge. Supports two formats: Reveal.js HTML (`public/deck-template/index.html`) and editable PowerPoint PPTX (edit and run `.ai/templates/generate-pptx.mjs`). Reveal.js output goes to `public/<event-slug>/index.html`; PPTX outputs to `public/downloads/offon-deck-template.pptx`. |

The `spec-first-coding` command is installed globally (`~/.claude/skills/`). Use
`/a11y-audit` for all accessibility audits.
