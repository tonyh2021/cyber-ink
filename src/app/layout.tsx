import type { Metadata } from "next";
import {
  Source_Sans_3,
  Noto_Sans_SC,
  JetBrains_Mono,
  Noto_Sans_Mono,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/workspace/sidebar-context";
import { StylesProvider } from "@/components/styles-provider";
import { listDirs, listFiles, readJson, readMarkdown } from "@/lib/data";
import type { ArticleMeta, ArticleTree, StoredStyles } from "@/types";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-noto-mono",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CyberInk",
  description: "AI writing decision engine",
};

async function getSeedStyles(): Promise<StoredStyles | null> {
  try {
    const [profileResult, instructionResult, polishPromptResult, references] =
      await Promise.all([
        readMarkdown("profiles/default.md")
          .then(({ frontmatter, content }) => ({
            name: (frontmatter.name as string) || "default",
            description: (frontmatter.description as string) || "",
            content,
          }))
          .catch(() => null),
        readMarkdown("instruction/instruction.md")
          .then(({ content }) => content)
          .catch(() => null),
        readMarkdown("instruction/polish-prompt.md")
          .then(({ content }) => content)
          .catch(() => null),
        listDirs("references")
          .then((dirs) =>
            Promise.all(
              dirs.map(async (dir) => {
                try {
                  const files = await listFiles(`references/${dir}`, ".md");
                  const articles = await Promise.all(
                    files.sort().map(async (f) => {
                      const { content } = await readMarkdown(
                        `references/${dir}/${f}`,
                      );
                      return { name: dir, filename: f, content };
                    }),
                  );
                  return { groupName: dir, articles };
                } catch {
                  return null;
                }
              }),
            ),
          )
          .then((groups) => groups.filter((g) => g !== null))
          .catch(() => []),
      ]);

    if (!profileResult && !instructionResult && !polishPromptResult) {
      return null;
    }

    return {
      profile: profileResult ?? {
        name: "default",
        description: "",
        content: "",
      },
      instruction: instructionResult ?? "",
      polishPrompt: polishPromptResult ?? "",
      references,
    };
  } catch {
    return null;
  }
}

async function getArticles() {
  let slugs: string[] = [];
  try {
    slugs = await listDirs("articles");
  } catch {
    return [];
  }

  const summaries = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const meta = await readJson<ArticleMeta>(`articles/${slug}/meta.json`);
        const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);
        return {
          slug: meta.slug,
          title: meta.title,
          versionCount: Object.keys(tree.nodes).length,
          activeNode: tree.latestNode,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt,
        };
      } catch {
        return null;
      }
    }),
  );

  return summaries
    .filter((s) => s !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [articles, seedStyles] = await Promise.all([
    getArticles(),
    getSeedStyles(),
  ]);
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} ${notoSansMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="data-theme" defaultTheme="system">
          <StylesProvider seedStyles={seedStyles}>
            <SidebarProvider initialArticles={articles}>
              {children}
            </SidebarProvider>
          </StylesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
