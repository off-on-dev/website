import type { Solution } from "@/data/solutions/types";
import { KATHARINA_SICK } from "@/data/adventures/contributors";

export const solution: Solution = {
  adventureId: "echoes-lost-in-orbit",
  levelId: "beginner",
  title: "Beginner Solution: Broken Echoes",
  contributor: { name: KATHARINA_SICK.name, url: KATHARINA_SICK.url },
  spoilerWarning:
    "This walkthrough contains the full solution. Try solving the challenge yourself first, then come back if you get stuck or want to compare approaches.",
  intro:
    "We'll approach this exactly as you would: start with the objectives, break them down one by one, and systematically fix what's broken.",
  context: {
    title: "Understanding the Setup",
    body: [
      {
        type: "text",
        html: "<p>The challenge uses three tools working together:</p><ul><li><strong>Argo CD ApplicationSet</strong> automatically generates Applications for multiple environments.</li><li><strong>Git directory generator</strong> scans for directories in the <code>overlays/</code> folder and finds <code>staging</code> and <code>prod</code>.</li><li><strong>Kustomize</strong> manages environment-specific configuration. The <em>base</em> holds the common deployment and service; <em>overlays</em> hold environment-specific customisations.</li></ul>",
      },
      {
        type: "text",
        html: "<p>The file to fix is <code>adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml</code>. Here is the broken starting state:</p>",
      },
      {
        type: "code",
        language: "yaml",
        title: "appset.yaml (broken)",
        code: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: echo-server
  namespace: argocd
spec:
  generators:
    - git:
        repoURL: __REPO_URL__
        revision: HEAD
        directories:
          - path: adventures/01-echoes-lost-in-orbit/beginner/manifests/overlays/*
  template:
    metadata:
      name: echo-server
      labels:
        app.kubernetes.io/managed-by: argocd
    spec:
      project: default
      source:
        repoURL: __REPO_URL__
        targetRevision: HEAD
        path: adventures/01-echoes-lost-in-orbit/beginner/manifests/overlays/{{path.basename}}
      destination:
        server: https://kubernetes.default.svc
        namespace: echo
      syncPolicy:
        syncOptions:
          - CreateNamespace=true`,
      },
    ],
  },
  steps: [
    {
      id: "two-applications",
      title: "Two Distinct Applications in Argo CD",
      intro:
        "Opening the Argo CD dashboard (port 30100), you won't see any applications despite the ApplicationSet being present.",
      body: [
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/beginner-no-apps.webp",
          alt: "Argo CD dashboard showing no applications",
        },
        {
          type: "text",
          html: "<p>Check whether the ApplicationSet exists and read its status:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl get applicationset -n argocd\nkubectl get applicationset echo-server -n argocd -o yaml",
        },
        {
          type: "text",
          html: "<p>Scroll to <code>status.conditions</code>. You should see:</p>",
        },
        {
          type: "code",
          language: "yaml",
          code: `- message: 'ApplicationSet echo-server contains applications with duplicate name: echo-server'
  reason: ErrorOccurred
  status: "False"`,
        },
        {
          type: "text",
          html: "<p>The template uses a static <code>name: echo-server</code> for every generated Application. Because both staging and prod generate an Application with that same name, Kubernetes rejects the duplicate. The fix is to include the directory name in the Application name:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix: unique name per environment",
          code: "name: echo-server-{{path.basename}}",
        },
        {
          type: "text",
          html: "<p>Apply and check the dashboard:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl apply -n argocd -f adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/beginner-two-apps.webp",
          alt: "Two applications syncing in Argo CD dashboard",
        },
      ],
      takeaways: [
        "ApplicationSets use templates to generate multiple Applications, and names must be unique per environment.",
        "The Git directory generator creates one Application per overlay directory, so template variables like {{path.basename}} are essential for dynamic naming.",
        "The ApplicationSet and Application status conditions are the first place to look when something isn't generating.",
      ],
      furtherReading: [
        {
          title: "Argo CD ApplicationSet documentation",
          url: "https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/",
        },
        {
          title: "ApplicationSet templates",
          url: "https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Template/",
        },
        {
          title: "Git directory generator",
          url: "https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Git/#git-generator-directories",
        },
      ],
    },
    {
      id: "isolated-namespaces",
      title: "Each Application in Its Own Namespace",
      intro:
        "Both applications now appear in Argo CD but they deploy to the same namespace: echo. Each environment needs its own namespace for isolation and to prevent resource conflicts.",
      body: [
        {
          type: "text",
          html: "<p>The same template variable technique fixes the namespace. Update the destination in the manifest:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix: environment-specific namespace",
          code: "destination:\n  server: https://kubernetes.default.svc\n  namespace: echo-{{path.basename}}",
        },
        {
          type: "text",
          html: "<p>Apply the change. Argo CD will now target <code>echo-staging</code> and <code>echo-prod</code> respectively:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl apply -n argocd -f adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml",
        },
      ],
      takeaways: [
        "Template variables work in any field of the ApplicationSet spec, not just the name.",
        "Namespace isolation prevents resource name collisions and makes per-environment RBAC and quotas straightforward.",
      ],
      furtherReading: [
        {
          title: "Kubernetes namespaces",
          url: "https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/",
        },
      ],
    },
    {
      id: "resilience",
      title: "Auto Sync and Self-Healing",
      intro:
        "The Applications now target separate namespaces but aren't syncing yet. We need two fixes: automatic sync from Git, and automatic revert of manual cluster changes.",
      body: [
        {
          type: "text",
          html: "<p>By default, Argo CD requires manual sync triggers. Enable automated sync in the ApplicationSet:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 1: enable auto sync",
          code: "syncPolicy:\n  automated:\n    enabled: true\n  syncOptions:\n    - CreateNamespace=true",
        },
        {
          type: "callout",
          variant: "tip",
          html: "<p>By default, Argo CD polls Git every 3 minutes. You can speed this up by configuring a webhook, but for this challenge a manual refresh in the UI is fine.</p>",
        },
        {
          type: "image",
          src: "/solutions/echoes-lost-in-orbit/beginner-healthy-apps.webp",
          alt: "Both applications synced and healthy in Argo CD",
        },
        {
          type: "text",
          html: "<p>Auto sync alone won't revert direct cluster changes. Add <code>selfHeal: true</code> to make Argo CD continuously reconcile against Git:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix 2: add self-healing",
          code: "syncPolicy:\n  automated:\n    enabled: true\n    selfHeal: true\n  syncOptions:\n    - CreateNamespace=true",
        },
        {
          type: "text",
          html: "<p>Test it: scale a deployment manually and watch Argo CD revert it within seconds.</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl scale deployment echo-server-staging -n echo-staging --replicas=3\nkubectl get pods -n echo-staging -w",
        },
      ],
      takeaways: [
        "Auto sync ensures Git changes reach the cluster without manual intervention.",
        "Self-healing reconciles drift: any manual change to cluster state is reverted to match Git.",
        "Auto sync + self-heal together are the foundation of a GitOps workflow.",
      ],
      furtherReading: [
        {
          title: "Argo CD automated sync policy",
          url: "https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/",
        },
        {
          title: "Automatic self-healing",
          url: "https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-self-healing",
        },
      ],
    },
    {
      id: "pruning",
      title: "Automatic Pruning of Stale Resources",
      intro:
        "The last objective: resources deleted from Git should also be deleted from the cluster. Without pruning, removed manifests leave orphaned objects behind.",
      body: [
        {
          type: "text",
          html: "<p>Add <code>prune: true</code> to the automated sync policy:</p>",
        },
        {
          type: "code",
          language: "yaml",
          title: "Fix: enable pruning",
          code: "syncPolicy:\n  automated:\n    enabled: true\n    selfHeal: true\n    prune: true\n  syncOptions:\n    - CreateNamespace=true",
        },
        {
          type: "text",
          html: "<p>Apply the final change:</p>",
        },
        {
          type: "code",
          language: "bash",
          code: "kubectl apply -n argocd -f adventures/01-echoes-lost-in-orbit/beginner/manifests/appset.yaml",
        },
        {
          type: "callout",
          variant: "info",
          html: "<p>Pruning is intentionally opt-in. Argo CD is cautious about deleting cluster resources automatically, so you must explicitly enable it.</p>",
        },
      ],
      takeaways: [
        "Pruning, combined with self-heal, gives you full GitOps: the cluster always matches the Git state exactly.",
        "Without pruning, deleted manifests leave stale objects that can cause resource conflicts or unexpected behaviour.",
      ],
      furtherReading: [
        {
          title: "Argo CD automatic pruning",
          url: "https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning",
        },
      ],
    },
  ],
  completeSolution: {
    title: "Complete ApplicationSet",
    description:
      "All four fixes applied. This ApplicationSet produces two isolated Applications with automated sync, self-healing, and pruning.",
    language: "yaml",
    code: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: echo-server
  namespace: argocd
spec:
  generators:
    - git:
        repoURL: __REPO_URL__
        revision: HEAD
        directories:
          - path: adventures/01-echoes-lost-in-orbit/beginner/manifests/overlays/*
  template:
    metadata:
      name: echo-server-{{path.basename}}  # unique name per environment
      labels:
        app.kubernetes.io/managed-by: argocd
    spec:
      project: default
      source:
        repoURL: __REPO_URL__
        targetRevision: HEAD
        path: adventures/01-echoes-lost-in-orbit/beginner/manifests/overlays/{{path.basename}}
      destination:
        server: https://kubernetes.default.svc
        namespace: echo-{{path.basename}}  # environment-specific namespace
      syncPolicy:
        automated:
          enabled: true     # automatic sync from Git
          selfHeal: true    # reverts manual cluster changes
          prune: true       # deletes removed resources
        syncOptions:
          - CreateNamespace=true`,
  },
  outro: {
    heading: "Transmissions Restored",
    html: "<p>Both Applications are healthy, syncing continuously from Git, reverting any drift the moment it appears, and cleaning up what no longer belongs. The Staging Moonbase and the Production Outpost are online. The Echo Server is echoing again.</p><p>The whispering cloud-dwellers of Nebulon and the rhythmic click-speakers of Crustacea Prime can hear each other once more. The GitOps Starliner moves on.</p><p>Got there by a different route? Found something that could be sharper?</p>",
  },
};
