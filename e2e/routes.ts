// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Single source of truth for the routes the e2e suite covers, shared by
// a11y.spec.ts, smoke.spec.ts and the drift gate in route-coverage.spec.ts.
// Keeping one copy is what lets route-coverage.spec.ts prove the build and the
// tests agree; three hand-maintained copies could not.

import { solution as beginnerSolution } from "@/data/solutions/echoes-lost-in-orbit/beginner";
import { solution as intermediateSolution } from "@/data/solutions/echoes-lost-in-orbit/intermediate";
import { solution as expertSolution } from "@/data/solutions/echoes-lost-in-orbit/expert";

// Route → expected exact <title>. Covers every layout type + all static pages.
export const SMOKE_ROUTES: Record<string, string> = {
  "/": "OffOn - Vendor-Neutral. Open Source. Community-Driven",
  "/adventures/": "Adventures - Open Source Learning Paths | OffOn",
  "/adventures/blind-by-design/": "Blind by Design - OffOn Adventures",
  "/adventures/blind-by-design/levels/beginner/": "Stand up the Lab - Blind by Design - OffOn",
  "/adventures/building-cloudhaven/": "Building CloudHaven - OffOn Adventures",
  "/adventures/building-cloudhaven/levels/beginner/": "The Foundation Stones - Building CloudHaven - OffOn",
  "/adventures/dead-reckoning/": "Dead Reckoning - OffOn Adventures",
  "/adventures/dead-reckoning/levels/expert/": "The Chronometer - Dead Reckoning - OffOn",
  "/adventures/echoes-lost-in-orbit/": "Echoes Lost in Orbit - OffOn Adventures",
  "/adventures/echoes-lost-in-orbit/levels/beginner/": "Broken Echoes - Echoes Lost in Orbit - OffOn",
  "/adventures/echoes-lost-in-orbit/levels/beginner/solution/":
    `${beginnerSolution.title} - Echoes Lost in Orbit - OffOn`,
  "/adventures/echoes-lost-in-orbit/levels/intermediate/solution/":
    `${intermediateSolution.title} - Echoes Lost in Orbit - OffOn`,
  "/adventures/echoes-lost-in-orbit/levels/expert/solution/":
    `${expertSolution.title} - Echoes Lost in Orbit - OffOn`,
  "/adventures/lex-imperfecta/": "Lex Imperfecta - OffOn Adventures",
  "/adventures/lex-imperfecta/levels/beginner/": "The Twelve Tables - Lex Imperfecta - OffOn",
  "/adventures/the-ai-observatory/": "The AI Observatory - OffOn Adventures",
  "/adventures/the-ai-observatory/levels/beginner/": "Calibrating the Lens - The AI Observatory - OffOn",
  "/challenges/": "Open Source Challenges | OffOn",
  "/challenges/opentelemetry/": "OpenTelemetry Challenges - OffOn",
  "/about/": "About OffOn - Building the contributors and maintainers of tomorrow",
  "/contribute/": "How to Contribute - OffOn",
  "/handbook/": "Handbook - OffOn",
  "/sponsors/": "Sponsorship and Independence - OffOn",
  "/brand/": "Brand Guidelines - OffOn",
  "/presentation-templates/": "Presentation Templates - OffOn",
  "/privacy/": "Privacy Policy - OffOn",
  "/accessibility/": "Accessibility Statement - OffOn",
  "/404/": "Page Not Found - OffOn",
};

export const A11Y_PAGES: string[] = [
  "/",
  "/adventures/",
  "/challenges/",
  "/adventures/blind-by-design/",
  "/adventures/blind-by-design/levels/beginner/",
  "/adventures/building-cloudhaven/",
  "/adventures/building-cloudhaven/levels/beginner/",
  "/adventures/dead-reckoning/",
  "/adventures/dead-reckoning/levels/expert/",
  "/adventures/echoes-lost-in-orbit/",
  "/adventures/echoes-lost-in-orbit/levels/beginner/",
  "/adventures/echoes-lost-in-orbit/levels/beginner/solution/",
  "/adventures/echoes-lost-in-orbit/levels/intermediate/solution/",
  "/adventures/echoes-lost-in-orbit/levels/expert/solution/",
  "/adventures/lex-imperfecta/",
  "/adventures/lex-imperfecta/levels/beginner/",
  "/adventures/the-ai-observatory/",
  "/adventures/the-ai-observatory/levels/beginner/",
  "/challenges/opentelemetry/",
  "/about/",
  "/contribute/",
  "/handbook/",
  "/privacy/",
  "/accessibility/",
  "/sponsors/",
  "/brand/",
  "/presentation-templates/",
  "/adventures/blind-by-design/levels/expert/",
  "/adventures/blind-by-design/levels/intermediate/",
  "/adventures/building-cloudhaven/levels/expert/",
  "/adventures/building-cloudhaven/levels/intermediate/",
  "/adventures/dead-reckoning/levels/beginner/",
  "/adventures/dead-reckoning/levels/intermediate/",
  "/adventures/echoes-lost-in-orbit/levels/expert/",
  "/adventures/echoes-lost-in-orbit/levels/intermediate/",
  "/adventures/lex-imperfecta/levels/expert/",
  "/adventures/lex-imperfecta/levels/intermediate/",
  "/adventures/the-ai-observatory/levels/expert/",
  "/adventures/the-ai-observatory/levels/intermediate/",
  "/404/",
];

/**
 * Built routes deliberately left out of the per-route suites, each with a reason.
 * Anything here is a decision; anything missing from every list fails the drift
 * gate in route-coverage.spec.ts.
 */
export const ROUTES_WITHOUT_FULL_COVERAGE: string[] = [
  // 24 remaining /challenges/<tag>/ routes. They are the same page component with
  // a different filter seed, so /challenges/opentelemetry/ is the representative.
  // Listed explicitly rather than pattern-matched so a new tag still has to be
  // acknowledged here.
  "/challenges/argo-cd/",
  "/challenges/argo-events/",
  "/challenges/argo-rollouts/",
  "/challenges/argo-workflows/",
  "/challenges/backstage/",
  "/challenges/flagd/",
  "/challenges/gitea/",
  "/challenges/github-actions/",
  "/challenges/grafana/",
  "/challenges/jaeger/",
  "/challenges/java/",
  "/challenges/kubernetes/",
  "/challenges/kyverno/",
  "/challenges/openfeature/",
  "/challenges/openllmetry/",
  "/challenges/opentofu/",
  "/challenges/policy-reporter/",
  "/challenges/prometheus/",
  "/challenges/promql/",
  "/challenges/python/",
  "/challenges/spring-boot/",
  "/challenges/tdd/",
  "/challenges/terraform/",
  "/challenges/trivy/",
];
