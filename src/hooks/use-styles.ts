import { useCallback, useSyncExternalStore } from "react";
import type { StoredStyles, StoredStyleProfile, StoredStyleReferenceGroup } from "@/types";
import { STYLE_DEFAULTS } from "@/lib/style-defaults";

const STORAGE_KEY = "cyberink:styles";

let cachedRaw: string | null = null;
let cachedParsed: StoredStyles = STYLE_DEFAULTS;

function getSnapshot(): StoredStyles {
  if (typeof window === "undefined") return STYLE_DEFAULTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedParsed;
  cachedRaw = raw;
  if (!raw) {
    cachedParsed = STYLE_DEFAULTS;
  } else {
    try {
      cachedParsed = JSON.parse(raw) as StoredStyles;
    } catch {
      cachedParsed = STYLE_DEFAULTS;
    }
  }
  return cachedParsed;
}

function getServerSnapshot(): StoredStyles {
  return STYLE_DEFAULTS;
}

let listeners: Array<() => void> = [];

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function writeStyles(styles: StoredStyles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  notify();
}

export function seedStylesIfEmpty(seed: StoredStyles | null) {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;
  const data = seed ?? STYLE_DEFAULTS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStyles() {
  const styles = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateProfile = useCallback((profile: StoredStyleProfile) => {
    const current = getSnapshot();
    writeStyles({ ...current, profile });
  }, []);

  const updateInstruction = useCallback((instruction: string) => {
    const current = getSnapshot();
    writeStyles({ ...current, instruction });
  }, []);

  const updatePolishPrompt = useCallback((polishPrompt: string) => {
    const current = getSnapshot();
    writeStyles({ ...current, polishPrompt });
  }, []);

  const updateReferences = useCallback((references: StoredStyleReferenceGroup[]) => {
    const current = getSnapshot();
    writeStyles({ ...current, references });
  }, []);

  return {
    styles,
    updateProfile,
    updateInstruction,
    updatePolishPrompt,
    updateReferences,
  };
}
