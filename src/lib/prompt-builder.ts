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
