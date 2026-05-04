"use client";

import { useEffect, type ReactNode } from "react";
import type { StoredStyles } from "@/types";
import { seedStylesIfEmpty } from "@/hooks/use-styles";

interface StylesProviderProps {
  seedStyles: StoredStyles | null;
  children: ReactNode;
}

export function StylesProvider({ seedStyles, children }: StylesProviderProps) {
  useEffect(() => {
    seedStylesIfEmpty(seedStyles);
  }, [seedStyles]);

  return <>{children}</>;
}
