// Copy this folder to src/data/solutions/<adventure-id>/ and fill in your values.
// If your level is not beginner, rename this file:
//   mv src/data/solutions/<adventure-id>/beginner.ts src/data/solutions/<adventure-id>/intermediate.ts
//   mv src/data/solutions/<adventure-id>/beginner.ts src/data/solutions/<adventure-id>/expert.ts
// Run `npm run generate:solutions` after saving.
// See src/data/solutions/types.ts for the full type definition.

import type { Solution } from "@/data/solutions/types";

export const solution: Solution = {
  // Must match a directory name in src/data/adventures/
  adventureId: "your-adventure-id",

  // One of: beginner | intermediate | expert
  levelId: "beginner",

  // Shown as the page <title> and the main heading
  title: "Beginner Solution: Your Challenge Name",

  // Optional — credit the person who wrote the walkthrough.
  // If they are already in src/data/adventures/contributors.ts, import them there
  // and use { name: THEIR_EXPORT.name, url: THEIR_EXPORT.url } instead.
  contributor: { name: "Your Name", url: "https://yoursite.com" },

  // Optional — shown at the top of the page before any content.
  // Use this to warn readers that the full solution follows.
  spoilerWarning:
    "This walkthrough contains the full solution. Try solving the challenge yourself first, then come back if you get stuck or want to compare approaches.",

  // Optional — one or two sentences introducing your overall approach.
  intro: "We'll approach this step by step, starting with the symptoms and working toward each fix.",

  // Optional — a context section shown before the numbered steps.
  // Use it to explain the tools, architecture, or starting state.
  context: {
    title: "Understanding the Setup",
    body: [
      {
        type: "text",
        html: "<p>Describe the environment or tooling the reader needs to understand before the steps.</p>",
      },
      {
        type: "code",
        language: "yaml",
        title: "Optional code title",
        code: "# The broken starting state",
      },
    ],
  },

  steps: [
    {
      // kebab-case ID used as the URL anchor for this step
      id: "first-step",

      // Shown as a heading above the step
      title: "Fix the First Problem",

      // Optional — a single sentence shown between the heading and the body blocks
      intro: "Brief description of what this step achieves.",

      body: [
        // Text block — prose content as an HTML string
        {
          type: "text",
          html: "<p>Explain what to observe, then what to do.</p>",
        },

        // Code block — syntax-highlighted, optionally titled
        {
          type: "code",
          language: "bash",
          // title is optional
          code: "echo hello",
        },

        // Image block — WebP files go in public/solutions/<adventure-id>/
        {
          type: "image",
          src: "/solutions/your-adventure-id/step-one-screenshot.webp",
          alt: "Describe what the screenshot shows",
          // caption is optional
          caption: "The dashboard after applying the fix.",
        },

        // Callout block — variant is tip | warning | info
        {
          type: "callout",
          variant: "tip",
          html: "<p>A useful aside that is helpful but not part of the main flow.</p>",
        },
      ],

      // Optional — bullet points shown after the body blocks.
      // Use these for the key things the reader should take away from this step.
      takeaways: [
        "What the reader should remember after this step.",
        "A second key insight.",
      ],
    },

    // Add more steps following the same structure
    {
      id: "second-step",
      title: "Fix the Second Problem",
      body: [
        {
          type: "text",
          html: "<p>Continue the walkthrough.</p>",
        },
      ],
    },
  ],

  // Optional — links shown in a "Further Reading" sidebar card
  furtherReading: [
    { title: "Official docs for the main tool", url: "https://example.com/docs" },
    { title: "Relevant concept explained", url: "https://example.com/concept" },
  ],

  // Optional — a final code card showing the complete corrected config or code
  completeSolution: {
    // title and description are optional
    title: "Complete Solution",
    description: "All fixes applied.",
    language: "yaml",
    code: "# Paste the full corrected file here",
  },

  // Optional — a narrative closing section rendered after the complete solution
  outro: {
    heading: "Challenge Complete",
    html: "<p>A short closing paragraph. What did the reader just accomplish? What comes next?</p>",
  },
};
