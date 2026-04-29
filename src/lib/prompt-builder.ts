interface PromptInput {
  profile: string;
  style: string;
  source: string;
  instruction: string;
  language: string;
}

interface PromptOutput {
  systemPrompt: string;
  userMessage: string;
}

export function buildPrompt(input: PromptInput): PromptOutput {
  const { profile, style, source, instruction, language } = input;

  const systemPrompt = [
    "## Profile",
    profile,
    "",
    "## Writing Style",
    style,
    "",
    "## Output Rules",
    `- Write in language: ${language}`,
    "- Output format: Markdown",
    "- Follow the style guidelines above",
    "- Do not include meta-commentary about the writing process",
  ].join("\n");

  const userMessage = [
    "## Source Material",
    source,
    "",
    "## Instruction",
    instruction,
  ].join("\n");

  return { systemPrompt, userMessage };
}
