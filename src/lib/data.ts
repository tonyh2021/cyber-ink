import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const DATA_DIR = path.join(process.cwd(), "data");

function resolvePath(relativePath: string): string {
  const resolved = path.resolve(DATA_DIR, relativePath);
  if (!resolved.startsWith(DATA_DIR)) {
    throw new Error("Path traversal outside data directory is not allowed");
  }
  return resolved;
}

export async function readMarkdown(
  relativePath: string
): Promise<{ frontmatter: Record<string, unknown>; content: string }> {
  const filePath = resolvePath(relativePath);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content: content.trim() };
}

export async function writeMarkdown(
  relativePath: string,
  frontmatter: Record<string, unknown>,
  content: string
): Promise<void> {
  const filePath = resolvePath(relativePath);
  await ensureDir(path.dirname(path.relative(DATA_DIR, filePath)));
  const output = matter.stringify(content, frontmatter);
  await fs.writeFile(filePath, output, "utf-8");
}

export async function readJson<T>(relativePath: string): Promise<T> {
  const filePath = resolvePath(relativePath);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function writeJson(
  relativePath: string,
  data: unknown
): Promise<void> {
  const filePath = resolvePath(relativePath);
  await ensureDir(path.dirname(path.relative(DATA_DIR, filePath)));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function ensureDir(relativePath: string): Promise<void> {
  const dirPath = resolvePath(relativePath);
  await fs.mkdir(dirPath, { recursive: true });
}

export async function removeDir(relativePath: string): Promise<void> {
  const dirPath = resolvePath(relativePath);
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function listDirs(relativePath: string): Promise<string[]> {
  const dirPath = resolvePath(relativePath);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function listFiles(
  relativePath: string,
  ext?: string
): Promise<string[]> {
  const dirPath = resolvePath(relativePath);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && (!ext || e.name.endsWith(ext)))
    .map((e) => e.name);
}

export function extractTitle(content: string): string | null {
  const match = /^#\s+(.+)$/m.exec(content);
  return match ? match[1].trim() : null;
}

export async function updateArticleTitle(
  slug: string,
  content: string,
): Promise<void> {
  const title = extractTitle(content);
  if (!title) return;
  const meta = await readJson<Record<string, unknown>>(
    `articles/${slug}/meta.json`,
  );
  if (meta.title === title) return;
  meta.title = title;
  meta.updatedAt = new Date().toISOString();
  await writeJson(`articles/${slug}/meta.json`, meta);
}

export async function exists(relativePath: string): Promise<boolean> {
  try {
    const filePath = resolvePath(relativePath);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
