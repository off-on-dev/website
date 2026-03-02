const tools = [
  "Kubernetes", "Prometheus", "ArgoCD", "Terraform", "OpenTelemetry",
  "Helm", "Grafana", "OPA", "Jaeger", "Docker", "SBOM", "GitOps",
];

export const ToolsMarquee = () => {
  const doubled = [...tools, ...tools];

  return (
    <section className="border-y border-[hsl(var(--surface-border))] overflow-hidden py-5">
      <div className="animate-marquee flex whitespace-nowrap">
        {doubled.map((tool, i) => (
          <span
            key={i}
            className="mx-8 font-mono text-sm text-[hsl(var(--text-faint))] select-none"
          >
            {tool}
          </span>
        ))}
      </div>
    </section>
  );
};
