import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import blindByDesignIntermediateDiagram from "@/assets/diagrams/blind-by-design-intermediate.svg";
import type { Adventure } from "./types";

export const BLIND_BY_DESIGN: Adventure = {
  id: "blind-by-design",
  title: "Blind by Design",
  month: "MAY 2026",
  story: "Three levels of OpenFeature with flagd as the provider, in a Java + Spring Boot service. Wire the SDK against a flagd sidecar (Beginner), layer evaluation context to target by cohort (Intermediate), then instrument flag evaluations with OpenTelemetry and roll back a misbehaving fractional rollout (Expert). All without redeploying.",
  tags: ["OpenFeature", "flagd", "Spring Boot", "Java", "OpenTelemetry", "Grafana"],
  contributor: {
    name: "Simon Schrottner",
    url: "https://schrottner.at/",
    about: "CNCF Ambassador and maintainer of OpenFeature and JUnit Pioneer. Helps teams release faster and with more confidence through open standards, feature flagging, and the communities that make both possible. A familiar face at KubeCon EU, Devoxx, ContainerDays, and meetups across Europe.",
  },
  levels: [
    {
      id: "beginner",
      name: "Stand up the Lab",
      difficulty: "Beginner",
      learnings: [
        "How an OpenFeature client and provider work together: the SDK is provider-agnostic and the flagd provider plugs in via dependency only",
        "What remote provider means in practice: the SDK calls a separate flag service (flagd) over gRPC, not parsing flags.json itself",
        "What flags.json looks like for flagd (state, variants, defaultVariant)",
        "Why hot-reload of the flag file matters operationally: configuration without redeploy",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_01-beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/wire-openfeature-flagd-into-a-spring-boot-service-with-zero-setup-adventure-04-beginner/1419`,
      intro: [
        "Wire the OpenFeature Java SDK and the flagd contrib provider into a Spring Boot service so flag evaluations are resolved by a flagd sidecar against a flags.json file. Author your first flag, then prove that editing flags.json flips the response on the next request: no app restart, no flagd restart, no redeploy.",
      ],
      backstory: [
        "The lab is on its first shift and it isn't reading the chart. Every subject who walks through the door gets the same hard-coded reading on their record, no matter what the lab director just signed off on. The label coming out of the lab is a literal string baked into the controller, not a reading pulled from the chart.",
        "Your mission: replace that hard-coded label with an OpenFeature client, point that client at the flagd sidecar that already runs next to your Codespace, and let flags.json drive what gets recorded as the subject's vision_state. Prove the lab can change what it records without restarting anything.",
      ],
      architecture: [
        "This level runs as two containers side-by-side in your Codespace: the Spring Boot lab and a flagd sidecar.",
        "The Spring Boot service runs on http://localhost:8080/ with one endpoint, GET /. flags.json is mounted read-only into the flagd sidecar; edit it through the IDE and flagd's file watcher picks up the change within about a second. The flagd sidecar serves flag evaluations over gRPC on :8013. The OpenFeature SDK reads FLAGD_HOST and FLAGD_PORT from the environment (pre-set by the devcontainer), so there is no host or port to hard-code.",
      ],
      objective: [
        "curl http://localhost:8080/ returns a vision_state reading resolved from flags.json (not the hard-coded 'untreated' fallback)",
        "The response payload includes OpenFeature evaluation details: flag key, variant, reason, and value",
        "Editing flags.json to change defaultVariant causes the next request to return the new variant without restarting the app or flagd",
      ],
      toolbox: [
        { name: "./mvnw", description: "Maven wrapper checked in next to pom.xml, builds and runs the Spring Boot lab" },
        { name: "curl", description: "makes requests to http://localhost:8080/ and shows the reading the lab records", url: "https://curl.se/" },
        { name: "jq", description: "pretty-prints and filters the JSON evaluation details returned by the SDK", url: "https://jqlang.org/" },
        { name: "flagd sidecar", description: "already running in the devcontainer compose stack on the docker-internal network, no port forwarding needed" },
      ],
      howToPlay: [
        { title: "Start the Lab", body: "Run the lab from the terminal, or press F5 in VS Code with `Laboratory.java` open. The lab starts in the broken state, returning the hard-coded 'untreated' response:\n\n```sh\n./mvnw spring-boot:run\n```" },
        { title: "Confirm the Broken State", body: "Open the Ports tab, set port 8080 to Public, then click the forwarded address to confirm the hard-coded 'untreated' response." },
        { title: "Add Dependencies", body: "Add the OpenFeature Java SDK and flagd contrib provider to `pom.xml`. GroupIds, artifactIds, and versions are in the OpenFeature Java SDK docs and the flagd Java provider README." },
        { title: "Configure the Provider", body: "Create a Spring `@Configuration` class that builds a `FlagdProvider` in RPC mode and registers it on the OpenFeature API at startup. No host or port to configure: the devcontainer pre-sets `FLAGD_HOST` and `FLAGD_PORT`." },
        { title: "Author Your First Flag", body: "Open `flags.json` and add a flag named `vision_state` with two string variants (for example 'blurry' and 'clouded') and a `defaultVariant`. flagd's file watcher picks up changes within about a second, no restart needed." },
        { title: "Wire the Evaluation", body: "Replace the hard-coded return in `Trial` with an OpenFeature evaluation of `vision_state`, returning the full evaluation details (flag key, variant, value, reason)." },
        { title: "Test Hot Reload", body: "Restart the lab. Confirm the value resolves from `flags.json`, then edit `flags.json`, change `defaultVariant`, save, and re-run curl without restarting anything:\n\n```sh\ncurl -s http://localhost:8080/ | jq\n```" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
    },
    {
      id: "intermediate",
      name: "Outcome by Cohort",
      difficulty: "Intermediate",
      learnings: [
        "How evaluation context works in OpenFeature: passing runtime attributes (user ID, cohort, region) to influence flag resolution",
        "How to configure flagd targeting rules to route specific cohorts to specific flag variants without code changes",
        "Why cohort-based rollouts reduce blast radius: only the targeted segment sees the new behaviour",
        "How to verify targeting is working correctly by inspecting flag evaluation results per context",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_02-intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/outcome-by-cohort-adventure-04-intermediate/1485`,
      intro: [
        "Populate all three OpenFeature evaluation-context layers on a Spring Boot service and register a custom Hook.",
        "Transaction context (request-scoped) is populated by a Spring HandlerInterceptor that reads ?species= and clears on afterCompletion so values don't leak across pooled threads. Global context (process-scoped) is set once at startup from the COUNTRY environment variable. Invocation context (call-site) is passed as the third argument to client.getStringDetails(), carrying the per-evaluation dose attribute. An Audit Hook fires after every evaluation and writes an [AUDIT] log line with a fixed PII-safe attribute allowlist.",
        "The broken-state lab already has the SDK and flagd provider wired in Resolver.RPC mode. The targeting in flags.json carries three branches but none of those attributes are in the eval context yet, so every request lands on the default variant. Your job: make the targeting fire by wiring the three context layers and the audit hook.",
      ],
      backstory: [
        "The trial is widening. Subjects from outside the lab's local population are getting the wrong reading on their chart, and the lab director has just walked in holding a stack of complaint forms. She wants the audit log to tell her exactly which vision_state the lab recorded for which subject, and she wants the lab to read the chart properly before it records any more bad readings.",
        "What differs between subjects is the observed outcome: some have a biology that responds enhancedly to the same serum, some absorb less or more than the protocol's standard dose, and the trial is registered in different jurisdictions with different baselines. Your shift: teach the lab to read each subject's species off the request, attach the trial's country of registration to the global context, pass the dose as invocation context at evaluation time, and register an audit hook.",
      ],
      architectureDiagram: blindByDesignIntermediateDiagram,
      diagramAlt: "HTTP flows through SpeciesInterceptor, Trial, and OpenFeature client left to right, then down through AuditHook and FlagdProvider, connecting via gRPC to a flagd sidecar.",
      architecture: [
        "The lab and a flagd sidecar run as siblings in the devcontainer's compose stack. The OpenFeature client uses Resolver.RPC to reach flagd:8013; flagd watches flags.json and serves evaluations from it.",
        "Three context layers merge before flagd evaluates the targeting rules: global context (country, set at startup), transaction context (species, set per request by the interceptor), and invocation context (dose, passed at the call site). Precedence on conflict: invocation > transaction > global.",
      ],
      objective: [
        "curl /?species=zyklop returns 'enhanced' regardless of dose or country",
        "With COUNTRY=de, curl /?dose=standard returns 'sharp'; with COUNTRY=at, the same call falls through to the default",
        "curl /?dose=underdose returns 'clouded'; curl /?species=zyklop&dose=underdose returns 'enhanced' (species takes precedence)",
        "Every evaluation produces an [AUDIT] log line naming the flag, the resolved variant, the reason, and the attributes that drove the outcome",
        "The response is never 'untreated' (that fallback only fires when the SDK cannot reach flagd)",
      ],
      toolbox: [
        { name: "Java 21 (Temurin)", description: "pre-installed in the devcontainer" },
        { name: "./mvnw", description: "Spring Boot Maven Wrapper, no global Maven install required" },
        { name: "curl", description: "sends requests to http://localhost:8080/ to test each targeting branch", url: "https://curl.se/" },
        { name: "jq", description: "pretty-prints the JSON evaluation details", url: "https://jqlang.org/" },
      ],
      howToPlay: [
        { title: "Wait for Setup", body: "Wait ~2-3 minutes for the Java toolchain to install." },
        { title: "Confirm the Broken State", body: "Start the lab and confirm the broken state, where no targeting fires yet. Stop the app and start fixing:\n\n```sh\n./mvnw spring-boot:run\ncurl 'http://localhost:8080/?species=zyklop'\n# returns 'blurry' — wrong cohort, targeting can't fire\n```" },
        { title: "Inspect the Targeting Rules", body: "Open `flags.json` and inspect the targeting. Three branches exist but none fire because nothing in the app populates the attributes yet:\n\n```json\n\"targeting\": {\n  \"if\": [\n    { \"===\": [{\"var\": \"species\"}, \"zyklop\"] },        \"enhanced\",\n    { \"in\":  [{\"var\": \"dose\"}, [\"underdose\", \"overdose\"]] }, \"clouded\",\n    { \"===\": [{\"var\": \"country\"}, \"de\"] },             \"sharp\"\n  ]\n}\n```\n\nYour job: populate `species`, `country`, and `dose` on the evaluation context so the targeting fires." },
        { title: "Build the SpeciesInterceptor", body: "Create a Spring `HandlerInterceptor` named `SpeciesInterceptor`: in `preHandle`, read `?species=` and put it on the transaction context; in `afterCompletion`, clear the context so values do not leak across pooled threads. Register a `ThreadLocalTransactionContextPropagator` once on the OpenFeature API in a static initializer." },
        { title: "Wire OpenFeatureConfig", body: "Update `OpenFeatureConfig` to: register `SpeciesInterceptor` with Spring (`WebMvcConfigurer.addInterceptors`), read the `COUNTRY` environment variable and set it as the global evaluation context, and register `AuditHook` globally on the OpenFeature API." },
        { title: "Update the Trial", body: "Update `Trial` so each evaluation passes `dose` on the invocation context (the third argument to `client.getStringDetails`). Default to 'standard', but make it overridable via `?dose=` so you can test each branch by hand." },
        { title: "Implement AuditHook", body: "Implement `AuditHook`: in `after()`, write an `[AUDIT]` log line with flag name, variant, reason, and a fixed allowlist of attributes (species, country, dose). Log at WARN when the variant is 'clouded', otherwise INFO. Implement `error()` so failed evaluations are not silent." },
        { title: "Test All Targeting Branches", body: "Run the lab with country-specific scripts. These pipe output through `tee app.log`, which the verifier needs:\n\n```sh\n./run-germany.sh   # COUNTRY=de\n./run-austria.sh   # COUNTRY=at\n```\n\nIn another terminal, verify each branch:\n\n```sh\ncurl -s 'http://localhost:8080/?species=zyklop' | jq .value\n# => \"enhanced\"\n\ncurl -s 'http://localhost:8080/?dose=standard' | jq .value\n# => \"sharp\" (Germany) / \"blurry\" (Austria)\n\ncurl -s 'http://localhost:8080/?dose=underdose' | jq .value\n# => \"clouded\"\n\ncurl -s 'http://localhost:8080/?species=zyklop&dose=underdose' | jq .value\n# => \"enhanced\" (species wins)\n```\n\nCheck the audit trail:\n\n```sh\ngrep '\\[AUDIT\\]' app.log | head\n```" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
    },
  ],
};
