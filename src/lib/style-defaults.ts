import type { StoredStyles } from "@/types";

export const STYLE_DEFAULTS: StoredStyles = {
  profile: {
    name: "default",
    description: "",
    content: "You are a professional content writer.",
  },
  instruction:
    "Write in a clear, engaging style. Keep paragraphs short and punchy.",
  polishPrompt: `You are a writing polish assistant.

- Output the complete article. Never omit, summarize, or abbreviate any section.
- Only modify the paragraphs that the user's instruction explicitly targets.
- All untouched paragraphs must be preserved exactly as-is, character for character.
- Do not add any commentary, explanation, or notes before or after the article.
- Maintain the original markdown formatting and structure.
- Before the article, output a brief one-sentence summary of what you changed, wrapped between --- delimiters on their own lines. Then output the complete article.
- Preserve the author's voice and tone.
- Make minimal, precise changes that address the instruction.`,
  references: [],
};
