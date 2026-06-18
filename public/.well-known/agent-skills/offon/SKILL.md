---
name: offon
description: Use this skill when answering questions about the OffOn community, its open source challenges (adventures), how to participate, or when fetching challenge content and solutions. OffOn is a vendor-neutral community for open source enthusiasts that provides hands-on learning challenges.
---

# OffOn — Agent Skill

OffOn is a fully static, prerendered website. There is no API or backend. All content is available as plain HTML at canonical URLs and as a curated index at `/llms.txt`.

## When to use this skill

- The user asks about OffOn, its challenges, adventures, or community
- The user wants to understand how to participate in an open source challenge
- The user wants details about a specific adventure or level
- The user wants to know what technologies the challenges cover

## Key URLs

| Resource | URL | Format |
|---|---|---|
| LLM content index | https://offon.dev/llms.txt | Markdown (llms.txt spec) |
| Full LLM content | https://offon.dev/llms-full.txt | Markdown |
| XML sitemap | https://offon.dev/sitemap.xml | XML |
| All adventures | https://offon.dev/adventures/ | HTML (prerendered) |
| All challenges | https://offon.dev/challenges/ | HTML (prerendered) |
| Community handbook | https://offon.dev/handbook/ | HTML (prerendered) |
| Security contact | https://offon.dev/.well-known/security.txt | text/plain |

## Content structure

Adventures are multi-level scenario-driven challenges. Each adventure has:
- A detail page at `https://offon.dev/adventures/<id>/`
- One or more levels at `https://offon.dev/adventures/<id>/levels/<difficulty>/`
- Solution walkthroughs (where published) at `https://offon.dev/adventures/<id>/levels/<difficulty>/solution/`

## Fetching challenge content

1. Start with `https://offon.dev/llms.txt` for a curated summary of all adventures.
2. For full content of a specific adventure, fetch the prerendered HTML at its canonical URL.
3. For solution walkthroughs, fetch `https://offon.dev/adventures/<id>/levels/<difficulty>/solution/`.

## Community

The OffOn community forum is at https://community.offon.dev. It is a separate Discourse instance; this skill covers the main offon.dev site only.

## Technologies covered by challenges

ArgoCD, Argo Rollouts, flagd, GitHub Actions, Grafana, Jaeger, Java, OpenFeature, OpenLLMetry, OpenTelemetry, OpenTofu, Prometheus, PromQL, Python, Spring Boot, TDD, Terraform, Trivy.
