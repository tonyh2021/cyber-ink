import type { PolishHistoryEntry } from "@/types";

interface PromptInput {
  profile: string;
  references: string[];
  commonInstruction: string;
  outputRules: string;
  source: string;
  instruction: string;
  language: string;
}

interface PromptOutput {
  systemPrompt: string;
  userMessage: string;
}

export function buildPrompt(input: PromptInput): PromptOutput {
  const { profile, references, commonInstruction, outputRules, source, instruction, language } = input;

  const parts = [
    "## Profile",
    profile,
    "",
  ];

  if (references.length > 0) {
    parts.push("## Reference Articles");
    parts.push("Study the following articles carefully. Match their voice, rhythm, humor, structure, and rhetorical techniques in your output.");
    parts.push("");
    references.forEach((ref, i) => {
      parts.push(`### Example ${i + 1}`);
      parts.push(ref);
      parts.push("");
    });
  }

  if (commonInstruction) {
    parts.push("## Style Instruction");
    parts.push(commonInstruction);
    parts.push("");
  }

  parts.push("## Output Rules");
  parts.push(`- Write in language: ${language}`);
  if (outputRules) {
    parts.push(outputRules);
  }

  const systemPrompt = parts.join("\n");

  const userMessage = [
    "## Source Material",
    source,
    "",
    "## Instruction",
    instruction,
  ].join("\n");

  return { systemPrompt, userMessage };
}

const POLISH_HARDCODED_RULES = `You are a writing polish assistant.
- Output the complete article. Never omit, summarize, or abbreviate any section.
- Only modify the paragraphs that the user's instruction explicitly targets.
- All untouched paragraphs must be preserved exactly as-is, character for character.
- Do not add any commentary, explanation, or notes before or after the article.
- Maintain the original markdown formatting and structure.
- Before the article, output a brief one-sentence summary of what you changed, wrapped between --- delimiters on their own lines. Then output the complete article.`;

const SLIDING_WINDOW_SIZE = 3;

interface PolishPromptInput {
  original: string;
  history: PolishHistoryEntry[];
  currentInstruction: string;
  polishPromptConfig: string;
}

interface PolishPromptOutput {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export function buildPolishPrompt(input: PolishPromptInput): PolishPromptOutput {
  const { original, history, currentInstruction, polishPromptConfig } = input;

  const systemParts = [POLISH_HARDCODED_RULES];
  if (polishPromptConfig.trim()) {
    systemParts.push("", polishPromptConfig.trim());
  }
  const systemPrompt = systemParts.join("\n");

  const messages: PolishPromptOutput["messages"] = [];

  messages.push({ role: "user", content: `原文:\n\n${original}` });

  const rounds: Array<{ instruction: string; output: string }> = [];
  for (let i = 0; i < history.length; i += 2) {
    const userEntry = history[i];
    const assistantEntry = history[i + 1];
    if (userEntry?.role === "user" && assistantEntry?.role === "assistant") {
      rounds.push({
        instruction: userEntry.content,
        output: assistantEntry.content,
      });
    }
  }

  const windowedRounds = rounds.slice(-SLIDING_WINDOW_SIZE);

  for (const round of windowedRounds) {
    messages.push({ role: "user", content: `修改: ${round.instruction}` });
    messages.push({ role: "assistant", content: round.output });
  }

  messages.push({ role: "user", content: `修改: ${currentInstruction}` });

  return { systemPrompt, messages };
}
