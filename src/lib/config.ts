import { readJson } from "./data";
import type { AppConfig } from "@/types";

export async function getConfig(): Promise<AppConfig> {
  return readJson<AppConfig>("config.json");
}
