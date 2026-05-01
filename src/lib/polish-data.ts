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
  await ensureDir(`${dir}/rounds`);
  await writeJson(`${dir}/target.json`, { node } satisfies PolishTarget);
  await writeRawFile(`${dir}/original.md`, content);
  await writeJson(`${dir}/history.json`, [] satisfies PolishHistoryEntry[]);
}

async function readRounds(dir: string): Promise<string[]> {
  const roundsDir = resolveDataPath(`${dir}/rounds`);
  let entries: string[];
  try {
    entries = await fs.readdir(roundsDir);
  } catch {
    return [];
  }
  const numbered = entries
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseInt(f, 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const rounds: string[] = [];
  for (const n of numbered) {
    rounds.push(await readRawFile(`${dir}/rounds/${n}.md`));
  }
  return rounds;
}

export async function getPolishStatus(slug: string): Promise<PolishStatus> {
  const dir = polishDir(slug);
  if (!(await exists(`${dir}/target.json`))) {
    return { active: false };
  }

  const target = await readJson<PolishTarget>(`${dir}/target.json`);
  const original = await readRawFile(`${dir}/original.md`);
  const rounds = await readRounds(dir);
  const history = await readJson<PolishHistoryEntry[]>(`${dir}/history.json`);

  return {
    active: true,
    node: target.node,
    original,
    rounds,
    history,
  };
}

export async function savePolishRound(
  slug: string,
  content: string,
): Promise<number> {
  const dir = polishDir(slug);
  await ensureDir(`${dir}/rounds`);
  const rounds = await readRounds(dir);
  const roundNumber = rounds.length + 1;
  await writeRawFile(`${dir}/rounds/${roundNumber}.md`, content);
  return roundNumber;
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
  roundIndex?: number,
): Promise<string> {
  const dir = polishDir(slug);
  const target = await readJson<PolishTarget>(`${dir}/target.json`);
  const rounds = await readRounds(dir);

  let chosenContent: string;
  if (pick === "original") {
    chosenContent = await readRawFile(`${dir}/original.md`);
  } else {
    const idx = roundIndex ?? rounds.length - 1;
    if (idx < 0 || idx >= rounds.length) {
      throw new Error("Invalid round index");
    }
    chosenContent = rounds[idx];
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
