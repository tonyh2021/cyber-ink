import fs from "fs/promises";
import path from "path";

const SEED_DIR = path.join(__dirname, "seed-data");
const DATA_DIR = path.join(process.cwd(), "data");

async function copyRecursive(src: string, dest: string) {
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    try {
      await fs.access(dest);
    } catch {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
      console.log(`  created ${path.relative(process.cwd(), dest)}`);
    }
  }
}

async function seed() {
  console.log("Seeding data directory...\n");
  await copyRecursive(SEED_DIR, DATA_DIR);

  await fs.mkdir(path.join(DATA_DIR, "articles/seed-article/nodes"), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, "articles/seed-article/evaluation"), { recursive: true });

  console.log("\nSeed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
