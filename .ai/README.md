# AI Templates

This directory contains project templates for OffOn contributors.

---

## AI prompts

Workflow-specific AI prompts live in [`.claude/commands/`](../.claude/commands/). Any AI assistant can use them: paste the relevant file as a system prompt or opening message. The YAML frontmatter block at the top (`---\nname: ...\n---`) is harmless and can be ignored.

**Claude Code users:** run the slash command directly — `/add-solution`, `/a11y-audit`, etc.

| File | What it does |
| --- | --- |
| `add-solution.md` | Generate a TypeScript solution walkthrough for a challenge from any input format |
| `a11y-audit.md` | Accessibility audit using persona simulation, semantic code review, and axe output |
| `create-presentation.md` | Create a Reveal.js or PowerPoint presentation deck |
| `keyboard.md` | Keyboard accessibility rules for interactive UI elements |
| `navigation.md` | Navigation landmark structure and accessibility rules |
| `progressive-enhancement.md` | Progressive enhancement rules for web features |
| `user-personalization.md` | User preference persistence and accessibility accommodation rules |

---

## Templates (`.ai/templates/`)

Reusable files for contributors.

| File | What it does |
| --- | --- |
| `solution/beginner.ts` | Annotated TypeScript template for writing a solution walkthrough |
| `generate-pptx.mjs` | Script that generates `public/downloads/offon-deck-template.pptx` |
| `generate-reveal-zip.mjs` | Script that generates `public/downloads/offon-reveal-template.zip` |
| `bg.png` | Pre-rendered firefly gradient background for presentation slides |
