import type { Metadata } from "next";
import {
  Source_Sans_3,
  Noto_Sans_SC,
  JetBrains_Mono,
  Noto_Sans_Mono,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/workspace/sidebar-context";
import { listDirs, readJson } from "@/lib/data";
import type { ArticleMeta, ArticleTree } from "@/types";
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
    })
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
  const articles = await getArticles();
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} ${notoSansMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="data-theme" defaultTheme="light">
          <SidebarProvider initialArticles={articles}>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
