#!/usr/bin/env bash
# Fails if new components, hooks, utilities, constants, scripts, or workflow
# files were added without updating the relevant documentation.
# Usage: bash scripts/check-docs.sh [base-ref]
# Default base-ref: origin/main

set -euo pipefail

BASE="${1:-origin/main}"

NEEDS_STYLEGUIDE=0
NEEDS_README=0
REASONS_STYLE=()
REASONS_README=()

# New component / hook / utility files require a styleguide.md entry.
while IFS=$'\t' read -r status file; do
  if [[ "$status" == "A" ]]; then
    case "$file" in
      src/components/*.tsx|src/hooks/*.ts|src/hooks/*.tsx|src/lib/*.ts)
        # Exclude shadcn primitives — they are managed by npx shadcn@latest, not documented manually.
        if [[ "$file" != src/components/ui/* ]]; then
          NEEDS_STYLEGUIDE=1
          REASONS_STYLE+=("New file: $file")
        fi
        ;;
    esac
  fi
done < <(git diff --name-status "$BASE"...HEAD)

# New exported constants in constants.ts require a README.md entry.
if git diff "$BASE"...HEAD -- src/data/constants.ts | grep -qE '^\+export const [A-Z_]+'; then
  NEEDS_README=1
  REASONS_README+=("New export(s) in src/data/constants.ts")
fi

# New npm scripts require a README.md entry.
# Compare only the "scripts" object — not the whole file — to avoid false positives
# when dependency names (e.g. "eslint") match the key pattern.
BASE_SCRIPTS=$(git show "$BASE":package.json 2>/dev/null | jq -r '.scripts // {} | keys[]' | sort)
HEAD_SCRIPTS=$(jq -r '.scripts // {} | keys[]' package.json | sort)
if comm -13 <(echo "$BASE_SCRIPTS") <(echo "$HEAD_SCRIPTS") | grep -q .; then
  NEEDS_README=1
  REASONS_README+=("New script(s) in package.json")
fi

# New workflow files require a README.md or CLAUDE.md entry.
while IFS=$'\t' read -r status file; do
  if [[ "$status" == "A" ]]; then
    case "$file" in
      .github/workflows/*.yml)
        NEEDS_README=1
        REASONS_README+=("New workflow: $file")
        ;;
    esac
  fi
done < <(git diff --name-status "$BASE"...HEAD)

STYLEGUIDE_CHANGED=$(git diff --name-only "$BASE"...HEAD | grep -c "^styleguide\.md$" || true)
README_CHANGED=$(git diff --name-only "$BASE"...HEAD | grep -c "^README\.md$" || true)
CLAUDE_CHANGED=$(git diff --name-only "$BASE"...HEAD | grep -c "^CLAUDE\.md$" || true)

ERRORS=0

if [[ $NEEDS_STYLEGUIDE -eq 1 ]] && [[ "$STYLEGUIDE_CHANGED" -eq 0 ]]; then
  echo "❌ styleguide.md was not updated. Reason(s):"
  for r in "${REASONS_STYLE[@]}"; do echo "   - $r"; done
  echo "   Update styleguide.md per the 'After Making Changes' section of CLAUDE.md."
  ERRORS=$((ERRORS + 1))
fi

if [[ $NEEDS_README -eq 1 ]] && [[ "$README_CHANGED" -eq 0 ]] && [[ "$CLAUDE_CHANGED" -eq 0 ]]; then
  echo "❌ README.md was not updated. Reason(s):"
  for r in "${REASONS_README[@]}"; do echo "   - $r"; done
  echo "   Update README.md per the 'After Making Changes' section of CLAUDE.md."
  ERRORS=$((ERRORS + 1))
fi

if [[ $ERRORS -gt 0 ]]; then
  exit 1
fi

echo "✓ Docs check passed."
