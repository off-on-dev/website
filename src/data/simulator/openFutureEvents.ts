import { GameEvent } from "./openFutureTypes";

export const OPENING_TEXT = `It's January. Outside, Munich is cold and grey. Inside, you're sitting in a glass-walled office that still smells like fresh paint. The sign on the door reads "Open Source Program Office" — someone printed it on an inkjet. There's no team page on the intranet yet.

The CTO stopped by this morning. "Look, I believe in this. But I need to see impact before the next board meeting. That's six months." She paused at the door. "And try not to upset Legal."

Your desk has a laptop, a stack of Post-its, and one enthusiastic generalist who joined because they heard 'open source' and got excited. The Slack channel #ospo has four members: you, your colleague, a curious intern, and a bot.

You have €75,000 this quarter, two people, and a mandate that's equal parts hope and skepticism. What you build from here will define not just this office, but how this company understands open source for years to come.

Where do you begin?`;

export const COMPANY_PROFILE = {
  name: "Europa GmbH",
  industry: "Enterprise software / B2B SaaS",
  employees: 2000,
  hq: "Munich, Germany",
  offices: ["Vienna", "Amsterdam", "Remote engineering team"],
  revenue: "€200M/year",
  techPosture: "Moderate cloud adoption; mix of proprietary and open source; no formal open source policy.",
};

export const EVENT_CATALOG: GameEvent[] = [
  {
    id: "E001", name: "Welcome to the OSPO", type: "story",
    description: "The CTO gives you a brief meeting. \"We're doing this because our competitor has one. Show me results in 6 months.\"",
    flavorText: "Dr. Sarah Chen leans against the doorframe, coffee in hand. Her calendar has 3 minutes blocked for this conversation.",
    earliestQuarter: 1, latestQuarter: 1, probability: 1,
    options: [
      { id: "E001A", label: "Start with compliance", description: "\"We'll begin by understanding our license obligations and building a policy framework.\"", effects: { politicalCapital: 5, reputation: 0 } },
      { id: "E001B", label: "Start with developer experience", description: "\"We'll make it easier for engineers to use and contribute to open source.\"", effects: { politicalCapital: -3, reputation: 5 }, risks: [{ description: "Legal raises concerns about uncontrolled contributions", probability: 0.3, effect: { politicalCapital: -5 } }] },
      { id: "E001C", label: "Start with upstream engagement", description: "\"We'll build our reputation in the ecosystem first.\"", effects: { politicalCapital: -5, reputation: 8 } },
    ],
    insightCard: { title: "Positioning the OSPO", realWorldContext: "The first year of an OSPO is almost always about establishing credibility.", expertAdvice: "Start where the organization's pain is greatest.", commonMistake: "Trying to do everything at once." },
  },
  {
    id: "E002", name: "The License Discovery", type: "crisis",
    description: "Routine scan reveals a GPL-licensed component in a proprietary product. Legal is nervous.",
    earliestQuarter: 1, latestQuarter: 2, probability: 0.9,
    options: [
      { id: "E002A", label: "Remove and replace", description: "Immediately remove the GPL component and replace it with a permissive alternative.", effects: { politicalCapital: 5 }, budgetCost: 15 },
      { id: "E002B", label: "Seek legal opinion", description: "Engage external counsel to assess actual risk.", effects: {}, budgetCost: 5, risks: [{ description: "Legal opinion says it's fine", probability: 0.5, effect: { politicalCapital: 3 } }, { description: "Legal opinion confirms risk", probability: 0.5, effect: { politicalCapital: -5, budget: -20 } }] },
      { id: "E002C", label: "Ignore it", description: "Nobody has complained yet. Move on.", effects: { politicalCapital: 2 }, risks: [{ description: "Litigation event surfaces in Year 3", probability: 0.4, effect: { politicalCapital: -20, budget: -50, reputation: -10 } }] },
    ],
    insightCard: { title: "License Compliance", realWorldContext: "License compliance issues in mixed codebases are common.", expertAdvice: "Implement automated license scanning early.", commonMistake: "Ignoring the issue because nobody has complained yet." },
  },
  {
    id: "E003", name: "The Intern's PR", type: "opportunity",
    description: "A summer intern submits a pull request to a popular open source project using company code. There's no contribution policy.",
    earliestQuarter: 2, latestQuarter: 4, probability: 0.8,
    options: [
      { id: "E003A", label: "Block the PR, create a policy", description: "Draft a formal contribution policy first.", effects: { reputation: -5, politicalCapital: 3 } },
      { id: "E003B", label: "Approve and draft policy in parallel", description: "Let the good work stand while building the framework.", effects: { reputation: 3, politicalCapital: -2 }, risks: [{ description: "IP concern surfaces later", probability: 0.2, effect: { politicalCapital: -8 } }] },
      { id: "E003C", label: "Let it slide", description: "It's just one PR.", effects: { reputation: 1 }, risks: [{ description: "More uncontrolled contributions follow", probability: 0.5, effect: { politicalCapital: -5 } }] },
    ],
  },
  {
    id: "E004", name: "Conference Budget Request", type: "politics",
    description: "A senior DevOps engineer wants to attend KubeCon and give a talk. Their manager says \"we don't fund that.\"",
    earliestQuarter: 2, latestQuarter: 3, probability: 0.85,
    options: [
      { id: "E004A", label: "Fund from OSPO budget", description: "Show that the OSPO supports developers.", effects: { reputation: 4, morale: 5 }, budgetCost: 3 },
      { id: "E004B", label: "Convince the manager", description: "Spend political capital to change the manager's mind.", effects: { reputation: 3, morale: 3 }, pcCost: 5 },
      { id: "E004C", label: "Decline", description: "Not a priority right now.", effects: { morale: -5, reputation: -2 } },
    ],
  },
  {
    id: "E005", name: "The Vendor Pitch", type: "opportunity",
    description: "A vendor offers a proprietary dependency scanning tool. Cheaper short-term, but creates lock-in.",
    earliestQuarter: 3, latestQuarter: 4, probability: 0.9,
    options: [
      { id: "E005A", label: "Accept vendor deal", description: "Saves money now. Lock-in is a problem for future you.", effects: { politicalCapital: 5, reputation: -5 }, budgetCost: -20 },
      { id: "E005B", label: "Choose open source alternative", description: "More expensive now, but builds capability.", effects: { reputation: 5, politicalCapital: -3 }, budgetCost: 30, headcountCost: 1 },
      { id: "E005C", label: "Negotiate hybrid with exit clause", description: "Use vendor but insist on data portability.", effects: { politicalCapital: 2 }, pcCost: 10, budgetCost: 5 },
    ],
    insightCard: { title: "Build vs. Buy", realWorldContext: "Vendor lock-in decisions compound.", expertAdvice: "Always negotiate exit clauses.", commonMistake: "Choosing based only on current-quarter cost." },
  },
  {
    id: "E006", name: "The \"Why Are We Paying For This?\" Email", type: "politics",
    description: "A VP sends a pointed email asking what the OSPO actually does. The CFO has replied with a thumbs-up emoji.",
    earliestQuarter: 3, latestQuarter: 4, probability: 0.85,
    options: [
      { id: "E006A", label: "Write a detailed impact report", description: "Document everything.", effects: { politicalCapital: 8 }, headcountCost: 1 },
      { id: "E006B", label: "Request a meeting", description: "Face-to-face is more effective.", effects: { politicalCapital: 12 }, pcCost: 5, risks: [{ description: "Presentation falls flat", probability: 0.3, effect: { politicalCapital: -8 } }] },
      { id: "E006C", label: "Forward metrics dashboard", description: "Let the data speak.", effects: { politicalCapital: 15 }, requirements: [{ type: "techTree", target: "devex", minValue: 1 }] },
    ],
  },
  {
    id: "E007", name: "First External Contributor", type: "milestone",
    description: "Someone outside your company submits a contribution to one of your open source projects.",
    earliestQuarter: 3, latestQuarter: 8, probability: 0.7,
    prerequisites: [{ type: "reputation", minValue: 25 }],
    options: [
      { id: "E007A", label: "Publicly thank and feature", description: "Write a blog post. Make it a moment.", effects: { reputation: 5 } },
      { id: "E007B", label: "Quietly merge", description: "Good work should be merged.", effects: { reputation: 2 } },
      { id: "E007C", label: "Reject due to missing CLA", description: "Technically correct.", effects: { reputation: -5 } },
    ],
  },
  {
    id: "E008", name: "The Dependency Incident", type: "crisis",
    description: "A critical dependency has a severe vulnerability. Your response time and preparedness are tested.",
    earliestQuarter: 5, latestQuarter: 7, probability: 0.95,
    options: [
      { id: "E008A", label: "Emergency response", description: "All hands on deck.", effects: { politicalCapital: 5, morale: -10 }, budgetCost: 10 },
      { id: "E008B", label: "Systematic response", description: "Use existing security infrastructure.", effects: { politicalCapital: 10, reputation: 5 }, requirements: [{ type: "techTree", target: "security", minValue: 1 }] },
      { id: "E008C", label: "Downplay and patch quietly", description: "Hope nobody notices.", effects: { politicalCapital: -5 }, risks: [{ description: "Security researcher goes public", probability: 0.4, effect: { reputation: -15, politicalCapital: -10 } }] },
    ],
    insightCard: { title: "Supply Chain Security", realWorldContext: "Supply chain attacks have shown that dependency vulnerabilities can affect every organization.", expertAdvice: "Build security scanning before you need it.", commonMistake: "Assuming popular libraries are secure." },
  },
  {
    id: "E009", name: "The Fork Proposal", type: "politics",
    description: "A product team wants to fork an open source project rather than contribute upstream.",
    earliestQuarter: 5, latestQuarter: 8, probability: 0.85,
    options: [
      { id: "E009A", label: "Allow the fork", description: "Let the team move fast.", effects: { politicalCapital: 3, reputation: -10 } },
      { id: "E009B", label: "Block and propose upstream", description: "Work with the community instead.", effects: { reputation: 5, politicalCapital: -3 }, pcCost: 5, headcountCost: 1 },
      { id: "E009C", label: "Fork with merge plan", description: "Fork now, upstream within 2 quarters.", effects: { reputation: 0, politicalCapital: 2 } },
    ],
  },
  {
    id: "E010", name: "EU Regulation Wave", type: "slowburn",
    description: "New EU regulation on software supply chain transparency. You have 3 quarters to prepare.",
    flavorText: "Thomas Richter from Legal forwards you a 200-page PDF with the subject line \"We need to talk.\"",
    earliestQuarter: 5, latestQuarter: 5, probability: 1,
    options: [
      { id: "E010A", label: "Start preparing now", description: "Invest early to avoid a crisis later.", effects: { politicalCapital: 5 }, budgetCost: 20, headcountCost: 1 },
      { id: "E010B", label: "Acknowledge and defer", description: "Note it and plan for next quarter.", effects: {} },
      { id: "E010C", label: "Ignore for now", description: "The regulation might change.", effects: {}, risks: [{ description: "Deadline arrives unprepared", probability: 0.8, effect: { politicalCapital: -15, budget: -40, reputation: -5 } }] },
    ],
  },
  {
    id: "E011", name: "Reorg Rumble", type: "politics",
    description: "Company reorganization threatens to absorb the OSPO into the legal department.",
    earliestQuarter: 6, latestQuarter: 8, probability: 0.7,
    options: [
      { id: "E011A", label: "Fight to maintain independence", description: "Spend political capital to stay autonomous.", effects: {}, pcCost: 20 },
      { id: "E011B", label: "Accept move to Legal", description: "Lose community focus but gain compliance backing.", effects: { politicalCapital: -5, reputation: -5 } },
      { id: "E011C", label: "Propose move to CTO office", description: "Counter with a higher strategic positioning.", effects: { politicalCapital: 10 }, pcCost: 15 },
    ],
  },
  {
    id: "E012", name: "The Maintainer Burnout", type: "ecosystem",
    description: "A key maintainer of a project your company depends on announces they're stepping down.",
    earliestQuarter: 6, latestQuarter: 8, probability: 0.8,
    options: [
      { id: "E012A", label: "Assign headcount to help maintain", description: "Become a co-maintainer.", effects: { reputation: 10 }, headcountCost: 1 },
      { id: "E012B", label: "Fund the maintainer", description: "Financial support.", effects: { reputation: 5 }, budgetCost: 20 },
      { id: "E012C", label: "Fork and maintain internally", description: "Take control, lose community goodwill.", effects: { reputation: -5 }, budgetCost: 10 },
      { id: "E012D", label: "Do nothing", description: "Hope someone else steps up.", effects: {}, risks: [{ description: "Dependency failure causes incident", probability: 0.5, effect: { politicalCapital: -10, budget: -15 } }] },
    ],
  },
  {
    id: "E013", name: "Open Source Day Proposal", type: "opportunity",
    description: "HR suggests an internal \"Open Source Day\" where engineers can contribute for a day.",
    earliestQuarter: 6, latestQuarter: 8, probability: 0.75,
    options: [
      { id: "E013A", label: "Full support", description: "Organize, fund, and make it an event.", effects: { politicalCapital: 10, reputation: 3, morale: 10 }, budgetCost: 8, headcountCost: 1 },
      { id: "E013B", label: "Minimal version", description: "Self-directed, low investment.", effects: { politicalCapital: 3, morale: 5 }, budgetCost: 2 },
      { id: "E013C", label: "Decline", description: "Not the right time.", effects: { morale: -3 } },
    ],
  },
  {
    id: "E014", name: "The Competitor's Announcement", type: "ecosystem",
    description: "A major competitor announces they're open sourcing a project similar to one your company uses internally.",
    earliestQuarter: 7, latestQuarter: 8, probability: 0.7,
    options: [
      { id: "E014A", label: "Open source yours too", description: "Race to community.", effects: { reputation: 15, politicalCapital: -5 }, budgetCost: 25, headcountCost: 2 },
      { id: "E014B", label: "Contribute to theirs", description: "Join their community.", effects: { reputation: 5, politicalCapital: -5 } },
      { id: "E014C", label: "Keep proprietary", description: "Keep the competitive advantage.", effects: { politicalCapital: 3, reputation: -3 } },
    ],
  },
  {
    id: "E015", name: "Foundation Invitation", type: "opportunity",
    description: "A major open source foundation invites your company to join as a member.",
    earliestQuarter: 9, latestQuarter: 11, probability: 0.8,
    prerequisites: [{ type: "reputation", minValue: 45 }],
    options: [
      { id: "E015A", label: "Join as Silver member", description: "Modest investment.", effects: { reputation: 5 }, budgetCost: 25 },
      { id: "E015B", label: "Join as Gold member", description: "Significant investment with governance access.", effects: { reputation: 15, politicalCapital: 5 }, budgetCost: 75 },
      { id: "E015C", label: "Decline for now", description: "Budget is tight.", effects: { reputation: -3 } },
    ],
  },
  {
    id: "E016", name: "The AI Licensing Debate", type: "slowburn",
    description: "Your ML team is using an AI model with unclear licensing. EU AI Act implications are emerging.",
    earliestQuarter: 9, latestQuarter: 9, probability: 1,
    options: [
      { id: "E016A", label: "Switch to open model", description: "Adopt a clearly licensed open source model.", effects: { reputation: 8, politicalCapital: -3 }, budgetCost: 15, headcountCost: 1 },
      { id: "E016B", label: "Keep proprietary with legal review", description: "Get legal sign-off.", effects: { politicalCapital: 3 }, budgetCost: 10 },
      { id: "E016C", label: "Hybrid approach", description: "Open model for EU data, proprietary for rest.", effects: { reputation: 3, politicalCapital: 2 }, budgetCost: 20, headcountCost: 1 },
    ],
  },
  {
    id: "E017", name: "The Acquisition Rumor", type: "ecosystem",
    description: "A vendor whose project you depend on is rumored to be acquired. If the license changes, you're exposed.",
    earliestQuarter: 10, latestQuarter: 12, probability: 0.75,
    options: [
      { id: "E017A", label: "Accelerate migration", description: "Expensive but proactive.", effects: { politicalCapital: 5, reputation: 3 }, budgetCost: 30, headcountCost: 2 },
      { id: "E017B", label: "Secure contractual guarantees", description: "Negotiate protection.", effects: { politicalCapital: -3 }, pcCost: 10 },
      { id: "E017C", label: "Invest in the community", description: "Strengthen the community around the project.", effects: { reputation: 8 }, headcountCost: 1 },
    ],
  },
  {
    id: "E019", name: "Budget Defense: Year 3", type: "story",
    description: "Major annual review. The board wants the OSPO to justify its existence with hard numbers.",
    flavorText: "\"Show me the ROI or show me the door.\"",
    earliestQuarter: 12, latestQuarter: 12, probability: 1,
    options: [
      { id: "E019A", label: "Present comprehensive metrics", description: "Let the numbers speak.", effects: { politicalCapital: 15, budget: 30 }, requirements: [{ type: "techTree", target: "devex", minValue: 2 }] },
      { id: "E019B", label: "Make a strategic case", description: "Frame value in terms of risk reduction.", effects: { politicalCapital: 8 }, pcCost: 10 },
      { id: "E019C", label: "Point to industry trends", description: "\"Everyone has an OSPO now.\"", effects: { politicalCapital: 3 }, risks: [{ description: "CFO is unimpressed", probability: 0.5, effect: { politicalCapital: -5, budget: -20 } }] },
    ],
  },
  {
    id: "E020", name: "The License Change Storm", type: "crisis",
    description: "A project your company uses heavily switches from open source to a restrictive license.",
    earliestQuarter: 10, latestQuarter: 12, probability: 0.85,
    options: [
      { id: "E020A", label: "Negotiate commercial license", description: "Pay for continued use.", effects: { politicalCapital: -5 }, budgetCost: 40 },
      { id: "E020B", label: "Migrate to open source fork", description: "Join the community fork.", effects: { reputation: 10 }, headcountCost: 2, budgetCost: 15 },
      { id: "E020C", label: "Accept new terms", description: "Path of least resistance.", effects: { politicalCapital: 3, reputation: -5 } },
      { id: "E020D", label: "Lead a community fork", description: "Massive commitment, massive reputation.", effects: { reputation: 20 }, headcountCost: 3, budgetCost: 25, requirements: [{ type: "reputation", minValue: 50 }] },
    ],
  },
  {
    id: "E021", name: "The Internal Open Source Project", type: "opportunity",
    description: "An engineering team wants to open source something they built. The request comes from them, not from you.",
    earliestQuarter: 13, latestQuarter: 14, probability: 0.9,
    options: [
      { id: "E021A", label: "Full governance support", description: "Help them do it right.", effects: { reputation: 10, politicalCapital: 8, morale: 5 }, headcountCost: 1 },
      { id: "E021B", label: "Light guidance", description: "Point them in the right direction.", effects: { reputation: 5, morale: 3 } },
      { id: "E021C", label: "Block until governance is ready", description: "You don't have the infrastructure yet.", effects: { morale: -10, reputation: -3 } },
    ],
  },
  {
    id: "E022", name: "Cross-Company Initiative", type: "opportunity",
    description: "Three peer companies propose a joint open source project. They want your company to co-lead.",
    earliestQuarter: 13, latestQuarter: 16, probability: 0.7,
    prerequisites: [{ type: "reputation", minValue: 55 }],
    options: [
      { id: "E022A", label: "Co-lead", description: "Take a leadership role.", effects: { reputation: 15, politicalCapital: 10 }, budgetCost: 30, headcountCost: 2 },
      { id: "E022B", label: "Participate as contributor", description: "Be part of it without leading.", effects: { reputation: 8, politicalCapital: 3 }, headcountCost: 1 },
      { id: "E022C", label: "Observe only", description: "Watch from the sidelines.", effects: { reputation: 1 } },
    ],
  },
  {
    id: "E023", name: "The Security Audit", type: "crisis",
    description: "External auditors flag your open source supply chain as a risk. The board is concerned.",
    earliestQuarter: 14, latestQuarter: 16, probability: 0.9,
    options: [
      { id: "E023A", label: "Show existing infrastructure", description: "If security maturity is high, handled smoothly.", effects: { politicalCapital: 15 }, requirements: [{ type: "techTree", target: "security", minValue: 3 }] },
      { id: "E023B", label: "Emergency remediation", description: "Build what you should have built earlier.", effects: { morale: -15 }, budgetCost: 35, headcountCost: 2 },
      { id: "E023C", label: "Partial response with roadmap", description: "Show progress and commit to a timeline.", effects: { politicalCapital: 3 }, budgetCost: 10 },
    ],
  },
  {
    id: "E024", name: "The Departing Expert", type: "politics",
    description: "Your most experienced team member is considering leaving.",
    earliestQuarter: 14, latestQuarter: 16, probability: 0.75,
    options: [
      { id: "E024A", label: "Counter-offer", description: "Raise and title.", effects: { morale: 10 }, budgetCost: 25, pcCost: 5 },
      { id: "E024B", label: "Interesting work retention", description: "Offer a new initiative to lead.", effects: {}, risks: [{ description: "They stay, energized", probability: 0.5, effect: { morale: 15, politicalCapital: 3 } }, { description: "They leave anyway", probability: 0.5, effect: { morale: -15, politicalCapital: -5 } }] },
      { id: "E024C", label: "Let them go", description: "People move on.", effects: { morale: -10 }, budgetCost: 15 },
    ],
  },
  {
    id: "E025", name: "Policy Advocacy Opportunity", type: "opportunity",
    description: "European Commission opens consultation on open source procurement guidelines.",
    earliestQuarter: 15, latestQuarter: 16, probability: 0.6,
    prerequisites: [{ type: "maturity", target: "governance", minValue: 2 }],
    options: [
      { id: "E025A", label: "Submit formal response", description: "Significant effort, major gains.", effects: { reputation: 15, politicalCapital: 5 }, headcountCost: 2 },
      { id: "E025B", label: "Join industry coalition", description: "Contribute to a joint response.", effects: { reputation: 5 }, headcountCost: 0.5 },
      { id: "E025C", label: "Skip", description: "Not our fight right now.", effects: {} },
    ],
  },
  {
    id: "E026", name: "The Board Presentation", type: "story",
    description: "For the first time, you're invited to present the OSPO's impact directly to the company board.",
    earliestQuarter: 17, latestQuarter: 18, probability: 1,
    options: [
      { id: "E026A", label: "Strategic vision presentation", description: "Present the OSPO as a strategic function.", effects: { politicalCapital: 20, budget: 50 }, requirements: [{ type: "maturity", target: "strategy", minValue: 3 }] },
      { id: "E026B", label: "Metrics-driven presentation", description: "Show the numbers.", effects: { politicalCapital: 15, budget: 30 }, requirements: [{ type: "techTree", target: "compliance", minValue: 3 }] },
      { id: "E026C", label: "General update", description: "Play it safe.", effects: { politicalCapital: 5 } },
    ],
  },
  {
    id: "E027", name: "Sustainability Crisis", type: "crisis",
    description: "A project central to your ecosystem loses all its maintainers. Corporate sponsors pull out.",
    earliestQuarter: 17, latestQuarter: 20, probability: 0.8,
    options: [
      { id: "E027A", label: "Become maintainer of last resort", description: "Your company saves the project.", effects: { reputation: 30 }, headcountCost: 3, budgetCost: 20 },
      { id: "E027B", label: "Fund a sustainability initiative", description: "Create a funding pool.", effects: { reputation: 15 }, budgetCost: 50 },
      { id: "E027C", label: "Migrate away", description: "Pragmatic but painful.", effects: { reputation: -3 }, budgetCost: 30, headcountCost: 2 },
      { id: "E027D", label: "Rally the ecosystem", description: "Use your reputation to coordinate.", effects: { reputation: 20, politicalCapital: 10 }, requirements: [{ type: "reputation", minValue: 70 }] },
    ],
  },
  {
    id: "E028", name: "Legacy Decision", type: "story",
    description: "As the campaign nears its end, you must decide the OSPO's future direction.",
    earliestQuarter: 19, latestQuarter: 20, probability: 1,
    options: [
      { id: "E028A", label: "Expand into a division", description: "Make the OSPO a formal division.", effects: { politicalCapital: 10, budget: 40 }, pcCost: 15 },
      { id: "E028B", label: "Embed and dissolve", description: "Open source is now everyone's job.", effects: { reputation: 10, politicalCapital: 5 }, requirements: [{ type: "maturity", target: "culture", minValue: 3 }] },
      { id: "E028C", label: "Sustain current model", description: "Document playbooks.", effects: { politicalCapital: 5 } },
      { id: "E028D", label: "Externalize as industry initiative", description: "Spin off best practices.", effects: { reputation: 20, politicalCapital: -5 }, requirements: [{ type: "reputation", minValue: 60 }] },
    ],
  },
  {
    id: "E029", name: "The Next Generation", type: "milestone",
    description: "A junior team member you mentored is ready to lead.",
    earliestQuarter: 19, latestQuarter: 20, probability: 0.7,
    prerequisites: [{ type: "maturity", target: "culture", minValue: 3 }],
    options: [
      { id: "E029A", label: "Support fully", description: "Let go of control.", effects: { morale: 15, reputation: 5, politicalCapital: 5 } },
      { id: "E029B", label: "Co-lead", description: "Share credit and risk.", effects: { morale: 8, politicalCapital: 3 } },
      { id: "E029C", label: "Advise but don't fund", description: "Cautious support.", effects: { morale: -3 } },
    ],
  },
  {
    id: "E030", name: "The Final Review", type: "story",
    description: "Five years. Twenty quarters. The comprehensive review. Everything is weighed.",
    earliestQuarter: 20, latestQuarter: 20, probability: 1,
    options: [
      { id: "E030A", label: "Review complete", description: "The journey ends. Time to see where it led.", effects: {} },
    ],
  },
];
