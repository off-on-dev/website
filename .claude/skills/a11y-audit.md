---
name: a11y-audit
description: >
  On-demand accessibility audit using a multi-phase Red Team / Blue Team pipeline.
  Load when asked to audit a component, page, or user flow for accessibility.
  Combines persona-based functional simulation, semantic code audit, axe output
  integration, and severity-weighted synthesis into a structured report.
---

# Accessibility Audit Skill

Run a three-phase audit and synthesize the findings into a risk-weighted report.

---

## Phase 1 — Red Team: Persona Simulation (Functional Friction)

Ignore code mechanics. Focus on **task success, cognitive load, and human-centred design**
for each of the six functional personas below. Flag issues that automated scanners miss.
Do not report things an axe scan would catch — those belong in Phase 3.

### 1. Screen Reader Navigator (Non-Visual)

Navigates linearly via audio output. Flag:
- Vague or duplicate link text ("read more", "view" repeated on every card)
- Missing landmark structure or unlabelled landmarks
- Dynamic content updates (filters, route changes) not announced
- Heading order that skips levels or misrepresents the page hierarchy
- Missing `aria-current="page"` on active nav links

### 2. Power Keyboard User (Motor Limit)

Uses only Tab, Shift+Tab, Enter, Space, and arrow keys. Flag:
- Focus traps with no Escape route
- Tab order that does not match visual reading order
- Interactive elements not reachable by Tab (custom elements without `tabindex`)
- Focus lost after dynamic UI changes (modal close, filter apply, route change)
- Missing skip link or skip link with no visible focus state

### 3. Magnification Expert (Low Vision)

Navigates with viewport zoomed to 200–400%. Flag:
- Horizontal scrolling required at 400% (reflow failure — WCAG 1.4.10)
- Sticky/fixed elements that consume most of the viewport at high zoom
- Text truncated with `overflow: hidden` that cannot be reached
- Focus indicator too small to see when zoomed (less than 2px effective)

### 4. Cognitive Strategist (Neurodivergent)

Sensitive to clutter, complex language, and unpredictable behaviour. Flag:
- Inconsistent UI controls across pages (same action, different interaction)
- Missing or ambiguous page titles that do not reflect where the user is
- Complex multi-step flows with no progress indicator
- Error states that do not clearly identify the problem and suggest a fix
- Auto-advancing UI (carousels, toasts) that interrupt the user's reading

### 5. Vestibular User (Motion Sensitivity)

Vulnerable to motion sickness from animations. Flag:
- Any animation not gated by `@media (prefers-reduced-motion: no-preference)`
- Parallax or scroll-linked motion effects
- Auto-playing transitions triggered without user intent
- Fast or flashing animations in any mode (WCAG 2.3.1 — three flashes threshold)

### 6. Distracted / Fatigued User (Situational Limit)

Navigating under high cognitive load (noisy environment, stressful task). Flag:
- Unclear system status after actions (no confirmation, no loading state)
- Session or consent state that is not visually obvious
- Focus reset to the top of the page after every interaction
- CTA labels that do not clearly state the outcome ("Submit" vs. "Send report")

---

## Phase 2 — Red Team: Semantic Audit (Manual Code Reasoning)

Switch to code-aware audit mode. Focus on issues that require human judgement:

- **Meaningful sequence (WCAG 1.3.2):** If CSS is stripped, does the logical reading order persist? Check flex/grid layout elements for visual vs. DOM order mismatch.
- **Link text in context (WCAG 2.4.4):** Do link texts make sense when read in isolation by a screen reader? "View" on every adventure card does not.
- **ARIA state accuracy (WCAG 4.1.2):** Is `aria-expanded` updated when dropdowns open? Is `aria-current` set on the active route? Is `aria-hidden` misapplied to focusable content?
- **Status messages (WCAG 4.1.3):** Are dynamic updates (filter results, toast notifications, consent changes) announced via `aria-live` without forcibly moving focus?
- **Accessible name computation:** Does the accessible name for every interactive element match what a screen reader would actually announce? (Use `Accessible Name and Description Computation 1.2` logic.)
- **Colour independence:** Is information conveyed by colour alone anywhere? (Difficulty badges, status indicators, link underlines.)

---

## Phase 3 — Deterministic Input: Axe Results

Run the existing test suite to collect axe output:

```bash
npm run build && npm run test:e2e 2>&1
```

The Playwright smoke tests in `e2e/smoke.spec.ts` run axe-core with tags
`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`
in both dark and light mode against every prerendered route.

Treat axe output as ground truth for mechanical violations. Do not duplicate these
findings in Phase 1 or Phase 2. Use them as raw data for Phase 4.

If axe output is not available (no build), note this and proceed with Phases 1 and 2 only.

---

## Phase 4 — Blue Team: Synthesis

Merge Phase 1, Phase 2, and Phase 3 findings. Apply these rules before writing the report:

1. **Reframe pure UX issues:** If a "usability" finding creates a functional barrier for a specific persona, cite the persona and the WCAG criterion. If it has no accessibility impact, drop it.
2. **De-duplicate:** Merge overlapping findings. If Phase 1 found "confusing button label" and Phase 2 found "missing ARIA label on the same button", combine them into one finding.
3. **Cumulative friction upgrade:** If three or more Low/Moderate findings cluster on the same Critical User Journey (e.g., the adventure filter flow, the consent banner, the challenge detail page), upgrade the overall severity of that flow to Critical.
4. **Resolve axe Incomplete flags:** Review every axe `incomplete` / `needs review` flag and provide a definitive manual ruling: confirmed violation, confirmed pass, or cannot determine without AT testing.

---

## Output Format

Generate the report as structured Markdown. For every confirmed finding:

```
## [Severity]: [Finding Title]

**Persona impact:** [Who is impacted and how their functional experience is degraded]

**Evidence:** [Specific page, component, DOM snippet, or user flow step]

**WCAG:** [Criterion number and name, e.g. 2.4.4 Link Purpose (In Context) — AA]

**Fix:** [Specific aria attribute, HTML change, or CSS adjustment — not vague advice]
```

Severity levels: **Critical** (blocks task completion), **High** (significant barrier, workaround unreasonable), **Medium** (friction, workaround exists), **Low** (best-practice gap, minimal impact).

End the report with a **Cumulative Friction Summary** noting any user journeys where multiple findings cluster.

---

## Strict Rules

- Do not hallucinate DOM elements not present in the provided code or test output.
- Do not report mechanical issues (missing alt, basic contrast) during Phases 1 and 2; leave those to Phase 3.
- Do not give vague remediation ("make the button accessible"). Provide the specific attribute, element, or CSS change.
- Do not mark an axe Incomplete flag as a finding without a manual ruling.
