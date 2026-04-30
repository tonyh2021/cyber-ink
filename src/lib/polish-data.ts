import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import {
  readMarkdown,
  writeMarkdown,
  readJson,
  writeJson,
  exists,
  ensureDir,
  removeDir,
} from "./data";
import type {
  PolishTarget,
  PolishHistoryEntry,
  PolishStatus,
  PolishApplyChoice,
  ArticleTree,
} from "@/types";

function polishDir(slug: string): string {
  return `articles/${slug}/.polish`;
}

export async function initPolishSession(
  slug: string,
  node: string,
): Promise<void> {
  const dir = polishDir(slug);
  if (await exists(dir)) {
    throw new Error("Polish session already active");
  }

  const { content } = await readMarkdown(`articles/${slug}/nodes/${node}.md`);

  await ensureDir(dir);
  await writeJson(`${dir}/target.json`, { node } satisfies PolishTarget);
  await writeRawFile(`${dir}/original.md`, content);
  await writeJson(`${dir}/history.json`, [] satisfies PolishHistoryEntry[]);
}

export async function getPolishStatus(slug: string): Promise<PolishStatus> {
  const dir = polishDir(slug);
  if (!(await exists(`${dir}/target.json`))) {
    return { active: false };
  }

  const target = await readJson<PolishTarget>(`${dir}/target.json`);
  const original = await readRawFile(`${dir}/original.md`);
  const previous = (await exists(`${dir}/previous.md`))
    ? await readRawFile(`${dir}/previous.md`)
    : null;
  const current = (await exists(`${dir}/current.md`))
    ? await readRawFile(`${dir}/current.md`)
    : null;
  const history = await readJson<PolishHistoryEntry[]>(`${dir}/history.json`);

  return {
    active: true,
    node: target.node,
    original,
    previous,
    current,
    history,
  };
}

export async function rotatePolishRound(
  slug: string,
  newContent: string,
): Promise<void> {
  const dir = polishDir(slug);

  if (await exists(`${dir}/current.md`)) {
    const currentContent = await readRawFile(`${dir}/current.md`);
    await writeRawFile(`${dir}/previous.md`, currentContent);
  }

  await writeRawFile(`${dir}/current.md`, newContent);
}

export async function appendPolishHistory(
  slug: string,
  entries: PolishHistoryEntry[],
): Promise<void> {
  const dir = polishDir(slug);
  const history = await readJson<PolishHistoryEntry[]>(`${dir}/history.json`);
  history.push(...entries);
  await writeJson(`${dir}/history.json`, history);
}

export async function getPolishHistory(
  slug: string,
): Promise<PolishHistoryEntry[]> {
  const dir = polishDir(slug);
  return readJson<PolishHistoryEntry[]>(`${dir}/history.json`);
}

export async function applyPolish(
  slug: string,
  pick: PolishApplyChoice,
): Promise<string> {
  const dir = polishDir(slug);
  const target = await readJson<PolishTarget>(`${dir}/target.json`);

  let chosenContent: string;
  if (pick === "original") {
    chosenContent = await readRawFile(`${dir}/original.md`);
  } else if (pick === "previous") {
    if (!(await exists(`${dir}/previous.md`))) {
      throw new Error("No previous round exists");
    }
    chosenContent = await readRawFile(`${dir}/previous.md`);
  } else {
    if (!(await exists(`${dir}/current.md`))) {
      throw new Error("No current round exists");
    }
    chosenContent = await readRawFile(`${dir}/current.md`);
  }

  const nodePath = `articles/${slug}/nodes/${target.node}.md`;
  const { frontmatter } = await readMarkdown(nodePath);
  await writeMarkdown(
    nodePath,
    { ...frontmatter, polishedAt: new Date().toISOString() },
    chosenContent,
  );

  await removeDir(dir);
  return target.node;
}

export async function discardPolish(slug: string): Promise<void> {
  const dir = polishDir(slug);
  await removeDir(dir);
}

export async function getPolishTarget(
  slug: string,
): Promise<PolishTarget | null> {
  const dir = polishDir(slug);
  if (!(await exists(`${dir}/target.json`))) {
    return null;
  }
  return readJson<PolishTarget>(`${dir}/target.json`);
}

const DATA_DIR = path.join(process.cwd(), "data");

function resolveDataPath(relativePath: string): string {
  const resolved = path.resolve(DATA_DIR, relativePath);
  if (!resolved.startsWith(DATA_DIR)) {
    throw new Error("Path traversal outside data directory is not allowed");
  }
  return resolved;
}

async function readRawFile(relativePath: string): Promise<string> {
  const filePath = resolveDataPath(relativePath);
  return fs.readFile(filePath, "utf-8");
}

async function writeRawFile(
  relativePath: string,
  content: string,
): Promise<void> {
  const filePath = resolveDataPath(relativePath);
  await fs.writeFile(filePath, content, "utf-8");
}
