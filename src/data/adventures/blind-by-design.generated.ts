import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import blindByDesignIntermediate from "@/assets/diagrams/blind-by-design-intermediate.svg";
import blindByDesignExpert from "@/assets/diagrams/blind-by-design-expert.svg";
import type { Adventure } from "./types";

export const BLIND_BY_DESIGN: Adventure = {
  id: "blind-by-design",
  title: "Blind by Design",
  icon: "FlaskConical",
  month: "MAY 2026",
  story: "Three levels of OpenFeature with flagd as the provider, in a Java + Spring Boot service. Wire the SDK against a flagd sidecar (Beginner), layer evaluation context to target by cohort (Intermediate), then instrument flag evaluations with OpenTelemetry and roll back a misbehaving fractional rollout (Expert). All without redeploying.",
  metaDescription: "OpenFeature is a vendor-neutral standard for feature flags. The reference cloud-native implementation is flagd, which serves flag definitions from a JSON...",
  tags: ["OpenFeature", "flagd", "Spring Boot", "Java", "OpenTelemetry", "Grafana"],
  contributor: {
    name: "Simon Schrottner",
    url: "https://schrottner.at/",
    aboutHtml: "CNCF Ambassador and maintainer of OpenFeature and JUnit Pioneer. Helps teams release faster and with more confidence through open standards, feature flagging, and the communities that make both possible. A familiar face at KubeCon EU, Devoxx, ContainerDays, and meetups across Europe.",
  },
  backstory: [
    "The Aletheia Institute is running a multi-phase vision-enhancement trial. The lab is a Spring Boot service whose one job is to record the vision_state of every subject who walks through the protocol (blurry, sharp, enhanced, or clouded), because subjects don't all arrive with the same biology, the same dose adherence, or the same trial-jurisdiction baseline. The flag definitions that drive those readings live in flags.json, watched by a flagd sidecar; the OpenFeature SDK is supposed to call that sidecar on every evaluation.",
    "It hasn't been. For the past eight months, every subject through the door has been recorded as \"untreated\": the integration was never finished, and the lab director assumed the system was reading the chart. Worse, eight weeks ago the Institute opened its flagship Phase 3 trial: a new amplifier variant rolled out fractionally to a cohort by a targeting rule in flags.json. Four adverse-event reports have since been filed, each one a subject whose vision_state at discharge was worse than at enrollment.",
    "The monitoring is dark, not by accident, but because no one ever turned the lights on. Your mission across three levels: stand up the lab so it reads the chart, read the chart by cohort so outcomes can be tracked, then turn on the lights and roll back the Phase 3 variant before the director signs off on the next enrollment batch.",
  ],
  overview: [
    "OpenFeature is a vendor-neutral standard for feature flags. The reference cloud-native implementation is flagd, which serves flag definitions from a JSON file, locally or remotely, and the OpenFeature SDK in your application calls it on every evaluation.",
    "In this adventure, the lab uses OpenFeature exactly the way a real engineering team would: a Spring Boot service holds the SDK client, flagd holds the flag definitions, and the targeting rules in flags.json decide what reading every subject ends up with. By the end, you'll have wired the SDK in from scratch, learned to record outcomes by cohort, and rolled back a misbehaving Phase 3 trial without redeploying.",
  ],
  rewards: {
    deadline: "2026-05-26T23:59:00+01:00",
    eligibility: "Complete all levels and post your solution in the community before the deadline to be eligible.",
    tiers: [
      { label: "1st place", description: "50% voucher for a Linux Foundation certification" },
      { label: "Top 3", description: "Credly badge to showcase the achievement" },
    ],
    rankingNote: "Ranking is determined by total points across all three levels. Points per level are awarded by submission order within the active week (100 for the first valid solution, 95 for the second, and so on; late submissions still earn 60).",
    rankingRulesUrl: `${COMMUNITY_URL}/t/about-the-challenges-category/16`,
  },
  levels: [
    {
      id: "beginner",
      name: "Stand up the Lab",
      difficulty: "Beginner",
      topics: ["OpenFeature", "flagd", "Spring Boot"],
      audience: "Platform engineers, <abbr title=\"Site Reliability Engineers\">SREs</abbr>, and developers curious about feature flags, with no prior OpenFeature experience needed, but familiarity with Spring Boot and basic Java will help.",
      learnings: [
        "How an OpenFeature client and provider work together: the SDK is provider-agnostic and the flagd provider plugs in via dependency only",
        "What remote provider means in practice: the SDK calls a separate flag service (flagd) over gRPC, not parsing flags.json itself",
        "What flags.json looks like for flagd (state, variants, defaultVariant)",
        "Why hot-reload of the flag file matters operationally: configuration without redeploy",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_01-beginner%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/wire-openfeature-flagd-into-a-spring-boot-service-with-zero-setup-adventure-04-beginner/1419`,
      deadline: "2026-05-26T23:59:00+01:00",
      intro: [
        "Wire the OpenFeature Java SDK and the flagd contrib provider into a Spring Boot service so flag evaluations are resolved by a flagd sidecar against a flags.json file. Author your first flag, then prove that editing flags.json flips the response on the next request: no app restart, no flagd restart, no redeploy.",
      ],
      backstory: [
        "The lab is on its first shift and it isn't reading the chart. Every subject who walks through the door gets the same hard-coded reading on their record, no matter what the lab director just signed off on. The label coming out of the lab is a literal string baked into the controller, not a reading pulled from the chart.",
        "Your mission: replace that hard-coded label with an OpenFeature client, point that client at the flagd sidecar that already runs next to your Codespace, and let flags.json drive what gets recorded as the subject's vision_state. Prove the lab can change what it records without restarting anything.",
      ],
      objective: [
        "curl <a href=\"http://localhost:8080/\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:8080/<span class=\"sr-only\"> (opens in new tab)</span></a> returns a vision_state reading resolved from flags.json (not the hard-coded 'untreated' fallback)",
        "The response payload includes OpenFeature evaluation details: flag key, variant, reason, and value",
        "Editing flags.json to change defaultVariant causes the next request to return the new variant without restarting the app or flagd",
      ],
      architecture: [
        "<p>This level runs as two containers side-by-side in your Codespace: the Spring Boot lab and a flagd sidecar.</p>",
        "<p>The Spring Boot service runs on <a href=\"http://localhost:8080/\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:8080/<span class=\"sr-only\"> (opens in new tab)</span></a> with one endpoint, GET /. flags.json is mounted read-only into the flagd sidecar; edit it through the <abbr title=\"Integrated Development Environment\">IDE</abbr> and flagd's file watcher picks up the change within about a second. The flagd sidecar serves flag evaluations over gRPC on :8013. The OpenFeature SDK reads FLAGD_HOST and FLAGD_PORT from the environment (pre-set by the devcontainer), so there is no host or port to hard-code.</p>",
      ],
      toolbox: [
        { name: "./mvnw", description: "Maven wrapper checked in next to pom.xml, builds and runs the Spring Boot lab" },
        { name: "curl", description: "makes requests to <a href=\"http://localhost:8080/\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:8080/<span class=\"sr-only\"> (opens in new tab)</span></a> and shows the reading the lab records", url: "https://curl.se/" },
        { name: "jq", description: "pretty-prints and filters the JSON evaluation details returned by the SDK", url: "https://jqlang.org/" },
        { name: "flagd sidecar", description: "already running in the devcontainer compose stack on the docker-internal network, no port forwarding needed" },
      ],
      howToPlay: [
        { title: "Start the Lab", content: `<p>Run the lab from the terminal, or press F5 in VS Code with <code>Laboratory.java</code> open. The lab starts in the broken state, returning the hard-coded 'untreated' response:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">./mvnw spring-boot:run
</code></pre>` },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 8080:</strong> Spring Boot lab. The lab endpoint. On first load you will see the hard-coded 'untreated' response. This is the broken state you are fixing.</li>
</ul>` },
        { title: "Add Dependencies", content: "<p>Add the OpenFeature Java SDK and flagd contrib provider to <code>pom.xml</code>. GroupIds, artifactIds, and versions are in the OpenFeature Java SDK docs and the flagd Java provider README.</p>" },
        { title: "Configure the Provider", content: "<p>Create a Spring <code>@Configuration</code> class that builds a <code>FlagdProvider</code> in RPC mode and registers it on the OpenFeature API at startup. No host or port to configure: the devcontainer pre-sets <code>FLAGD_HOST</code> and <code>FLAGD_PORT</code>.</p>" },
        { title: "Author Your First Flag", content: "<p>Open <code>flags.json</code> and add a flag named <code>vision_state</code> with two string variants (for example 'blurry' and 'clouded') and a <code>defaultVariant</code>. flagd's file watcher picks up changes within about a second, no restart needed.</p>" },
        { title: "Wire the Evaluation", content: "<p>Replace the hard-coded return in <code>Trial</code> with an OpenFeature evaluation of <code>vision_state</code>, returning the full evaluation details (flag key, variant, value, reason).</p>" },
        { title: "Test Hot Reload", content: `<p>Restart the lab. Confirm the value resolves from <code>flags.json</code>, then edit <code>flags.json</code>, change <code>defaultVariant</code>, save, and re-run curl without restarting anything:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">curl -s http://localhost:8080/ | jq
</code></pre>` },
      ],
      helpfulLinks: [
        { title: "OpenFeature Java SDK", url: "https://openfeature.dev/docs/reference/technologies/server/java/" },
        { title: "flagd Java provider", url: "https://github.com/open-feature/java-sdk-contrib/tree/main/providers/flagd" },
        { title: "flagd flag definitions", url: "https://flagd.dev/reference/flag-definitions/" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "Wire the OpenFeature Java SDK and flagd provider into a Spring Boot service. Author a flag in flags.json and prove hot-reload works without restarting the app.",
    },
    {
      id: "intermediate",
      name: "Outcome by Cohort",
      difficulty: "Intermediate",
      topics: ["OpenFeature", "flagd", "Spring Boot", "Java"],
      learnings: [
        "How OpenFeature's transaction-context propagation works in a thread-per-request server, and why a ThreadLocalTransactionContextPropagator is the right primitive for Servlet-based apps",
        "The difference between request-scoped context (the subject's species) and global evaluation context (the trial's country), and when each is the right tool",
        "How hooks let you attach cross-cutting behaviour, audit logging today and OpenTelemetry tracing tomorrow, without modifying every flag evaluation call site",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_02-intermediate%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/outcome-by-cohort-adventure-04-intermediate/1485`,
      deadline: "2026-05-26T23:59:00+01:00",
      intro: [
        "Populate all three OpenFeature evaluation-context layers on a Spring Boot service and register an AuditHook. Transaction context comes from a HandlerInterceptor, global context from the COUNTRY environment variable at startup, and invocation context at the call site. The targeting in flags.json already has three branches for species, dose, and country, but none fire yet because the context layers are missing.",
      ],
      backstory: [
        "The trial is widening. Subjects from outside the lab's local population are getting the wrong reading on their chart, and the lab director has just walked in holding a stack of complaint forms. She wants the audit log to tell her, after the fact, exactly which vision_state the lab recorded for which subject, and she wants the lab to read the chart properly before it records any more bad readings.",
        "The protocol is the same for every subject; the lab is not varying the trial. What differs is the observed outcome: some subjects have a biology that responds enhancedly to the same serum, some absorb less or more than the protocol's standard dose, and the trial is registered in different jurisdictions with different baselines.",
        "Your shift: teach the lab to read each subject's species off the request, attach the trial's country of registration (set on the JVM via the COUNTRY environment variable) to the global context, pass the dose as invocation context at the moment of the flag evaluation, and register an audit hook that records every dose with its variant and reason.",
      ],
      objective: [
        "curl /?species=zyklop returns 'enhanced' regardless of dose or country",
        "With COUNTRY=de, curl /?dose=standard returns 'sharp'; with COUNTRY=at, the same call falls through to the default",
        "curl /?dose=underdose returns 'clouded'; curl /?species=zyklop&#x26;dose=underdose returns 'enhanced' (species takes precedence)",
        "Every evaluation produces an [AUDIT] log line naming the flag, the resolved variant, the reason, and the attributes that drove the outcome",
        "The response is never 'untreated' (that fallback only fires when the SDK cannot reach flagd)",
      ],
      architectureDiagram: blindByDesignIntermediate,
      diagramAlt: "HTTP flows through SpeciesInterceptor, Trial, and OpenFeature client left to right, then down through AuditHook and FlagdProvider, connecting via gRPC to a flagd sidecar.",
      toolbox: [
        { name: "Java 21 (Temurin)", description: "pre-installed in the devcontainer" },
        { name: "./mvnw", description: "Spring Boot Maven Wrapper, no global Maven install required" },
        { name: "curl", description: "sends requests to <a href=\"http://localhost:8080/\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:8080/<span class=\"sr-only\"> (opens in new tab)</span></a> to test each targeting branch", url: "https://curl.se/" },
        { name: "jq", description: "pretty-prints the JSON evaluation details", url: "https://jqlang.org/" },
        { name: "tail -f", description: "watches the application log live for [AUDIT] lines" },
      ],
      howToPlay: [
        { title: "Wait for Setup", content: "<p>Wait ~2-3 minutes for the Java toolchain to install. Use <code>Cmd/Ctrl + Shift + P</code> then <code>View Creation Log</code> to watch progress. When the post-create finishes you'll have Java 21, the Maven wrapper, and the broken-state lab ready in <code>adventures/04-blind-by-design/intermediate/</code>.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 8080:</strong> Spring Boot lab. The application under test. Access via the Ports tab or curl <a href="http://localhost:8080/" target="_blank" rel="noopener noreferrer">http://localhost:8080/<span class="sr-only"> (opens in new tab)</span></a>.</li>
</ul>` },
        { title: "Confirm the Broken State", content: `<p>Start the lab and confirm the broken state, where no targeting fires yet:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">./mvnw spring-boot:run
curl 'http://localhost:8080/?species=zyklop'
# returns 'blurry', wrong cohort, targeting can't fire
</code></pre>
<p>That <code>"blurry"</code> is the starting point you want: even when the request shouts <code>species=zyklop</code>, the lab has nothing in its evaluation context, so flagd's targeting cannot fire and every subject drops to the default variant. Stop the app and start fixing.</p>` },
        { title: "Inspect the Starting Point", content: `<p>The lab already has the OpenFeature SDK and the flagd contrib provider on the classpath, and the <code>FlagdProvider</code> is wired in <code>Resolver.RPC</code> mode against the flagd sidecar. Open <code>flags.json</code> and inspect the targeting. Three branches exist but none fire because nothing in the app populates <code>species</code>, <code>country</code>, or <code>dose</code> yet:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-json">"targeting": {
  "if": [
    { "===": [{"var": "species"}, "zyklop"] },        "enhanced",
    { "in":  [{"var": "dose"}, ["underdose", "overdose"]] }, "clouded",
    { "===": [{"var": "country"}, "de"] },             "sharp"
  ]
}
</code></pre>
<p>Your job: populate <code>species</code>, <code>country</code>, and <code>dose</code> on the evaluation context so the targeting fires.</p>` },
        { title: "Build the SpeciesInterceptor", content: "<p>Create a Spring <code>HandlerInterceptor</code> named <code>SpeciesInterceptor</code>: in <code>preHandle</code>, read <code>?species=</code> and put it on the transaction context; in <code>afterCompletion</code>, clear the context so values do not leak across pooled threads. Register a <code>ThreadLocalTransactionContextPropagator</code> once on the OpenFeature API in a static initializer. Without the propagator the SDK has no way to carry per-request context across the call into the controller, and the transaction context silently stays empty.</p>" },
        { title: "Wire OpenFeatureConfig", content: "<p>Update <code>OpenFeatureConfig</code> to: register <code>SpeciesInterceptor</code> with Spring (<code>WebMvcConfigurer.addInterceptors</code>), read the <code>COUNTRY</code> environment variable and set it as the global evaluation context, and register <code>AuditHook</code> globally on the OpenFeature API. The three context layers, global (<code>country</code>), transaction (<code>species</code> from the interceptor), and invocation (<code>dose</code> from <code>Trial</code>), merge before flagd evaluates the rules. Precedence on conflict is invocation over transaction over global.</p>" },
        { title: "Update the Trial", content: "<p>Update <code>Trial</code> so each evaluation passes <code>dose</code> on the invocation context (the third argument to <code>client.getStringDetails</code>). Default to <code>'standard'</code> most of the time but occasionally to <code>'underdose'</code> or <code>'overdose'</code>, that is the lab tech mis-measuring, and it is what makes the improper-dosing branch in <code>flags.json</code> fire at all. Make it overridable via <code>?dose=</code> so you can test each branch by hand. If the invocation context does not carry <code>dose</code>, the targeting rule sees <code>null</code> and the branch never fires: every non-zyklop request lands on either the country branch or the default.</p>" },
        { title: "Implement AuditHook", content: "<p>Implement <code>AuditHook</code>: in <code>after()</code>, write an <code>[AUDIT]</code> log line with flag name, variant, reason, and a fixed allowlist of attributes (species, country, dose). Log at WARN when the variant is <code>'clouded'</code> so the safety officer can grep for it, otherwise INFO. Implement <code>error()</code> so failed evaluations are not silent. Use a fixed allowlist (<code>List.of(\"species\", \"country\", \"dose\")</code>) rather than iterating the whole context: audit logs outlive app logs, and logging only what you decided to log pays off the moment something sensitive lands on the context.</p>" },
        { title: "Test All Targeting Branches", content: `<p>Run the lab with country-specific scripts. These pipe output through <code>tee app.log</code>, which the verifier greps for <code>[AUDIT]</code> lines. If you run <code>./mvnw spring-boot:run</code> directly, add <code>| tee app.log</code> or the verifier has nothing to grep:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">./run-germany.sh    # COUNTRY=de  (or: make lab-germany)
./run-austria.sh    # COUNTRY=at
</code></pre>
<p>Three named launch configs in <code>.vscode/launch.json</code> (Germany / Austria / No country) also let you switch cohorts from the Run and Debug view.</p>
<p>In another terminal, verify each branch:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">curl -s 'http://localhost:8080/?species=zyklop' | jq .value
# => "enhanced"

curl -s 'http://localhost:8080/?dose=standard' | jq .value
# => "sharp" (Germany) / "blurry" (Austria)

curl -s 'http://localhost:8080/?dose=underdose' | jq .value
# => "clouded"

curl -s 'http://localhost:8080/?species=zyklop&#x26;dose=underdose' | jq .value
# => "enhanced" (species wins)
</code></pre>
<p>Check the audit trail:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">grep '\\[AUDIT\\]' app.log | head
</code></pre>
<p>You should see one <code>[AUDIT] flag=vision_state variant=... reason=... species=... country=... dose=...</code> line per request. <code>clouded</code> outcomes log at WARN.</p>` },
      ],
      helpfulLinks: [
        { title: "OpenFeature Java SDK", url: "https://openfeature.dev/docs/reference/technologies/server/java/" },
        { title: "OpenFeature Hooks", url: "https://openfeature.dev/docs/reference/concepts/hooks" },
        { title: "Spring HandlerInterceptor", url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html" },
        { title: "flagd flag definitions", url: "https://flagd.dev/reference/flag-definitions/" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "Add OpenFeature evaluation context and an AuditHook to a Spring Boot service. Target flag evaluations by species, country, and dose to record cohort outcomes.",
    },
    {
      id: "expert",
      name: "Read the Chart",
      difficulty: "Expert",
      topics: ["OpenFeature", "OpenTelemetry", "Grafana", "Spring Boot"],
      audience: "Platform engineers, <abbr title=\"Site Reliability Engineers\">SREs</abbr>, and observability-focused developers who have completed the Beginner and Intermediate levels or are comfortable with OpenFeature evaluation context, and want to learn how flag evaluations join distributed traces and metrics, and how to use a flag flip as an operational lever for live rollbacks.",
      learnings: [
        "How the OpenFeature OpenTelemetry hooks (TracesHook and MetricsHook) join flag evaluations to the rest of an application's telemetry without a separate ingestion path",
        "How to author your own Hook: a tiny class that copies merged-eval-context attributes onto the active OTel span, closing the loop between why a flag resolved the way it did and what the operator sees in Tempo",
        "How fractional rollout in flagd buckets users by targetingKey (same key, same bucket, every request) and how to read that bucketing off a dashboard",
        "How a flag flip is a faster operational lever than a redeploy when a rollout is misbehaving: the difference between a one-line config change and a twenty-minute deployment",
      ],
      codespacesUrl: `${CODESPACES_BASE}?devcontainer_path=.devcontainer%2F04-blind-by-design_03-expert%2Fdevcontainer.json&quickstart=1`,
      discussionUrl: `${COMMUNITY_URL}/t/read-the-chart-adventure-04-expert/1530`,
      deadline: "2026-05-26T23:59:00+01:00",
      intro: [
        "Spans are already flowing into Tempo from the OpenFeature TracesHook, but the metrics half is dead: the MeterProvider has no exporter and the MetricsHook was never registered.",
        "The dashboard the operator wants to triage from is empty. The k6 loadgen is idle, waiting for a flag flip to turn it on.",
      ],
      backstory: [
        "The trial just went wide. Phase 3 of the new vision amplifier (vision_amplifier_v2) was approved for the full cohort yesterday morning. The promise was straightforward: subjects emerge with sharper eyesight than they walked in with. By mid-afternoon the audit log was screaming. Subjects were stabilising 200ms slower, and roughly one in ten of them was emerging blind, with containment failure recorded as an HTTP 500. The lab director pulled up the Feature Flag Metrics dashboard expecting to triage visually. The dashboard was dark. Someone had wired up traces but never finished the metrics half. There is no chart to read. The lab is studying eyesight and the lab itself cannot see.",
        "Your job, in order: turn on the lights, find the bad arm of the trial, and halt enrolment on the amplifier, all without redeploying the lab. That last constraint is the whole point of feature flags: when a rollout starts misbehaving in production, you need an operational lever that does not take twenty minutes to pull. Save the file, watch the dose drop, watch the 5xx rate fall back to baseline, watch the next batch of subjects walk out seeing.",
      ],
      objective: [
        "Spans for fun-with-flags-java-spring are visible in Tempo with feature_flag.context. attributes. Searching feature_flag.context.dose=underdose lights up requests where a subject was mis-dosed, with feature_flag.variant=clouded on the same span",
        "feature_flag_evaluation_requests_total is non-zero in Prometheus: flag evaluations show up as counters, not just spans",
        "The Feature Flag Metrics dashboard renders: variant distribution, error rate, and latency p99 are all populated from the metric counters",
        "The vision_amplifier_v2 rollout is rolled back to 100% off without redeploying the lab",
        "HTTP 5xx rate over the last minute drops below 1%: the bad arm is contained",
      ],
      architectureDiagram: blindByDesignExpert,
      diagramAlt: "Architecture diagram showing four services: Spring Boot app sends traces via OTLP/gRPC to a Grafana LGTM stack, connects via OpenFeature SDK to flagd for feature flag evaluation, and a k6 load generator polls flagd and scrapes metrics from the LGTM stack.",
      toolbox: [
        { name: "Java 21 (Temurin)", description: "pre-installed in the devcontainer", url: "https://adoptium.net/" },
        { name: "./mvnw", description: "Spring Boot Maven Wrapper, no global Maven install required" },
        { name: "curl", description: "sends requests to <a href=\"http://localhost:8080/\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:8080/<span class=\"sr-only\"> (opens in new tab)</span></a> to test the lab, and to Prometheus on <a href=\"http://localhost:9090/\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:9090/<span class=\"sr-only\"> (opens in new tab)</span></a> to query metrics directly", url: "https://curl.se/" },
        { name: "Grafana", description: "browser UI at <a href=\"http://localhost:3000\" target=\"_blank\" rel=\"noopener noreferrer\">http://localhost:3000<span class=\"sr-only\"> (opens in new tab)</span></a> (admin/admin) for the Feature Flag Metrics dashboard and Tempo trace explorer" },
        { name: "jq", description: "pretty-prints the JSON evaluation details", url: "https://jqlang.org/" },
      ],
      howToPlay: [
        { title: "Start Your Challenge", content: "<p>The sibling containers (flagd, Grafana LGTM, k6 loadgen) start automatically as part of the devcontainer compose. Wait ~2-3 minutes for them to be ready before moving on.</p>" },
        { title: "Explore the UIs", content: `<p>Open the <strong>Ports</strong> tab and navigate to each service:</p>
<ul>
<li><strong>Port 8080:</strong> Spring Boot lab. Add ?userId=subject-42 for a stable fractional-rollout bucketing key.</li>
<li><strong>Port 3000:</strong> Grafana (admin / admin). Open Dashboards > Feature Flag Metrics (empty until metrics are wired). Try Explore > Tempo to see flag evaluations as span events.</li>
<li><strong>Port 9090:</strong> Prometheus. Query metrics directly via the Prometheus UI or curl <a href="http://localhost:9090/api/v1/query" target="_blank" rel="noopener noreferrer">http://localhost:9090/api/v1/query<span class="sr-only"> (opens in new tab)</span></a>.</li>
<li><strong>Port 3200:</strong> Tempo. Tempo HTTP API used by the verify script to assert traces are flowing.</li>
</ul>
<p>flagd runs on the docker-internal network only. No port forwarding needed.</p>` },
        { title: "Start the Lab", content: `<p>The sibling containers are already up. Boot the Spring Boot lab by clicking <strong>Run</strong> on <code>Laboratory</code> in the Spring Boot Dashboard panel (or press <strong>F5</strong> with <code>Laboratory.java</code> open), or from the terminal:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-sh">./mvnw spring-boot:run
</code></pre>
<p>Spans start flowing into Tempo on the first request. The trace pipeline is already wired. The metrics pipeline is dead (task 4a), so the Grafana dashboard panels stay empty until you fix it.</p>` },
        { title: "Turn On the Metrics Exporter", content: `<p>OTel ships two parallel pipelines: traces (already flowing into Tempo) and metrics (dead). The OTel Java Agent attached to the lab JVM has both pipelines plumbed and pointed at the LGTM stack, but <code>otel.properties</code> (next to <code>pom.xml</code>) sets <code>otel.metrics.exporter=none</code>, so anything the meter records goes nowhere.</p>
<p>Open <code>otel.properties</code> and flip the exporter on. While you're there, look at the export interval. The default makes the next steps harder than they need to be.</p>
<p>Once the exporter is on, <code>MetricsHook</code> (next step) finds the working meter provider through <code>GlobalOpenTelemetry</code> without any further plumbing. You will need to restart the lab to pick up the change.</p>` },
        { title: "Register MetricsHook", content: `<p><code>OpenFeatureConfig.java</code> registers <code>TracesHook</code> but stops there. <code>MetricsHook</code> needs an <code>OpenTelemetry</code> handle to find the meter provider. The agent installs one globally at JVM start, so <code>GlobalOpenTelemetry.get()</code> is the way to reach it.</p>
<p>Register <code>MetricsHook</code> alongside <code>TracesHook</code> in <code>OpenFeatureConfig</code>. The Feature Flag Metrics dashboard stays empty until traffic drives through. That is what the loadgen step does.</p>` },
        { title: "Write and Register ContextSpanHook", content: `<p>The two contrib hooks tell you <em>what</em> happened: which flag, which variant, which reason. What is missing is the <em>why</em> visible in Tempo. Write a <code>ContextSpanHook</code> that copies the merged eval context attributes onto the active OTel span as <code>feature_flag.context.&#x3C;key></code>:</p>
<pre tabindex="0" aria-label="Code block"><code class="language-text">before(hookCtx) {
    span = active OTel span
    for each allowlisted key in merged eval context:
        span.setAttribute("feature_flag.context." + key, value)
}
</code></pre>
<p><code>HookContext.getCtx()</code> returns the merged evaluation context (global + transaction + invocation). Use a fixed allowlist of <code>List.of("species", "country", "dose")</code>. Never iterate the whole context: <code>targetingKey</code> joins to PII in real apps, and span attributes are retained for days in Tempo at scale.</p>
<p>Register <code>ContextSpanHook</code> alongside <code>TracesHook</code> and <code>MetricsHook</code> in <code>OpenFeatureConfig</code>. The verifier searches Tempo for <code>feature_flag.context.dose=underdose</code> once you are done.</p>` },
        { title: "Turn On the Loadgen", content: `<p><code>flags.json</code> has two flags: <code>loadgen_active</code> (off by default) and the misbehaving <code>vision_amplifier_v2</code>. flagd watches the file and picks up changes within about a second.</p>
<p>Flip <code>loadgen_active</code> to on. The k6 loadgen polls it every two seconds and starts five virtual users hammering the lab. Within a minute, latency p99 should climb ~200ms and the 5xx rate ~10% on the dashboard, confirming that the bad arm of <code>vision_amplifier_v2</code> is active.</p>` },
        { title: "Roll Back the Rollout", content: `<p>The dashboard's variant-distribution panel shows which variant is the culprit. Roll it back by editing <code>flags.json</code> to set <code>vision_amplifier_v2</code> to 100% off.</p>
<p><strong>No deploy. No rebuild. No restart of the lab.</strong></p>
<p>Watch the dashboard: the 5xx rate falls back to baseline, and the next batch of subjects walks out seeing.</p>` },
      ],
      helpfulLinks: [
        { title: "OpenFeature OTel contrib hooks (Java)", url: "https://github.com/open-feature/java-sdk-contrib/tree/main/hooks/open-telemetry" },
        { title: "OpenTelemetry Java Agent configuration", url: "https://opentelemetry.io/docs/zero-code/java/agent/configuration/" },
        { title: "OpenFeature Hooks concept", url: "https://openfeature.dev/docs/reference/concepts/hooks" },
        { title: "flagd fractional operation", url: "https://flagd.dev/reference/custom-operations/fractional-operation/" },
        { title: "OpenTelemetry security guidance", url: "https://opentelemetry.io/docs/security/" },
      ],
      verification: {
        command: "./verify.sh",
        description: "Once you think you've solved the challenge, run the verification script. If it fails it will tell you which checks didn't pass. If it passes, it generates a Certificate of Completion you can paste into the discussion.",
      },
      metaDescription: "Wire OpenTelemetry metrics into an OpenFeature Java app, author a ContextSpanHook, then roll back a bad rollout by flipping a flag in flags.json. No redeploy.",
    },
  ],
};
