import { readMarkdown, listFiles } from "@/lib/data";
import { StylesPage } from "@/components/styles/styles-page";

interface StyleData {
  filename: string;
  name: string;
  version: string;
  description: string;
  content: string;
}

interface ProfileData {
  name: string;
  description: string;
  content: string;
}

async function getProfile(): Promise<ProfileData> {
  const { frontmatter, content } = await readMarkdown("profiles/default.md");
  return {
    name: (frontmatter.name as string) || "default",
    description: (frontmatter.description as string) || "",
    content,
  };
}

async function getStyles(): Promise<StyleData[]> {
  let files: string[] = [];
  try {
    files = await listFiles("styles", ".md");
  } catch {
    return [];
  }

  const styles = await Promise.all(
    files.map(async (file) => {
      try {
        const { frontmatter, content } = await readMarkdown(`styles/${file}`);
        return {
          filename: file.replace(".md", ""),
          name: (frontmatter.name as string) || file.replace(".md", ""),
          version: (frontmatter.version as string) || "",
          description: (frontmatter.description as string) || "",
          content,
        };
      } catch {
        return null;
      }
    })
  );

  return styles.filter((s) => s !== null);
}

export default async function StylesRoute() {
  const [profile, styles] = await Promise.all([getProfile(), getStyles()]);
  return <StylesPage profile={profile} styles={styles} />;
}
