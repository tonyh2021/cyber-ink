import type { PolishHistoryEntry } from "@/types";

interface PromptInput {
  profile: string;
  references: string[];
  commonInstruction: string;
  outputRules: string;
  source: string;
  instruction: string;
}

interface PromptOutput {
  systemPrompt: string;
  userMessage: string;
}

export function buildPrompt(input: PromptInput): PromptOutput {
  const { profile, references, commonInstruction, outputRules, source, instruction } = input;

  const parts = [
    "## Profile",
    profile,
    "",
  ];

  if (references.length > 0) {
    parts.push("## Reference Articles");
    parts.push("Study the following articles carefully. Extract their writing techniques — voice, rhythm, humor, structure, and rhetorical devices — and apply those techniques to your output. Do not imitate their subject matter.");
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

  if (outputRules) {
    parts.push("## Output Rules");
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

  const systemPrompt = polishPromptConfig.trim();

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
