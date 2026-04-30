interface PromptInput {
  profile: string;
  references: string[];
  commonInstruction: string;
  source: string;
  instruction: string;
  language: string;
}

interface PromptOutput {
  systemPrompt: string;
  userMessage: string;
}

export function buildPrompt(input: PromptInput): PromptOutput {
  const { profile, references, commonInstruction, source, instruction, language } = input;

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
  parts.push("- Output format: Markdown");
  if (references.length > 0) {
    parts.push("- Match the voice and style of the reference articles above");
  }
  parts.push("- Do not include meta-commentary about the writing process");
  parts.push("- Do not add editorial sections, disclaimers, or concluding opinions that are not part of the article itself");

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
