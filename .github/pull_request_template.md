<!-- CI handles lint, build, tests, axe, touch targets, focus rings, forced colors, zoom, focus traps, and REUSE licence compliance. New file types/extensions must be declared in REUSE.toml or CI will block the merge. -->

## Type of change

- [ ] `feat` new feature
- [ ] `fix` bug fix
- [ ] `refactor` no behavior change
- [ ] `docs` / `chore` / `config` / `perf` / `style` / `security`

## Manual checks

- [ ] Screen reader tested _(UI changes only)_
- [ ] New routes added to sitemap.xml, prerender array, README _(routes only)_
- [ ] UI verified at 375px, 768px, and 1280px against the production build (`npm run build && npm run preview`) _(UI changes only)_
- [ ] Re-read every changed file; checked all call sites of any modified exports _(all changes)_
- [ ] Per-level discussion JSON exists with correct `discussionUrl` _(adventure/level changes only)_
