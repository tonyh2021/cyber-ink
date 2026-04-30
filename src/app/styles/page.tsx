import { readMarkdown, listDirs, listFiles } from "@/lib/data";
import { StylesPage } from "@/components/styles/styles-page";

export interface ReferenceArticle {
  name: string;
  filename: string;
  content: string;
}

export interface ReferenceGroup {
  name: string;
  references: ReferenceArticle[];
}

export interface ProfileData {
  name: string;
  description: string;
  content: string;
}

async function getInstruction(): Promise<string> {
  try {
    const { content } = await readMarkdown("instruction/instruction.md");
    return content;
  } catch {
    return "";
  }
}

async function getProfile(): Promise<ProfileData> {
  const { frontmatter, content } = await readMarkdown("profiles/default.md");
  return {
    name: (frontmatter.name as string) || "default",
    description: (frontmatter.description as string) || "",
    content,
  };
}

async function getStyles(): Promise<ReferenceGroup[]> {
  let dirs: string[] = [];
  try {
    dirs = await listDirs("styles");
  } catch {
    return [];
  }

  const styles = await Promise.all(
    dirs.map(async (dir) => {
      try {
        const files = await listFiles(`styles/${dir}`, ".md");
        const references = await Promise.all(
          files.sort().map(async (f) => {
            const { content } = await readMarkdown(`styles/${dir}/${f}`);
            return { name: dir, filename: f, content };
          })
        );
        return { name: dir, references };
      } catch {
        return null;
      }
    })
  );

  return styles.filter((s) => s !== null);
}

export default async function StylesRoute() {
  const [instruction, profile, references] = await Promise.all([
    getInstruction(),
    getProfile(),
    getStyles(),
  ]);
  return <StylesPage instruction={instruction} profile={profile} references={references} />;
}
