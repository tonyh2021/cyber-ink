"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TextSelection {
  text: string;
  rect: DOMRect;
}

export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const popoverRef = useRef<HTMLElement | null>(null);

  const clear = useCallback(() => {
    setSelection(null);
  }, []);

  const setPopoverRef = useCallback((el: HTMLElement | null) => {
    popoverRef.current = el;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        return;
      }

      const range = sel.getRangeAt(0);
      if (!container!.contains(range.commonAncestorContainer)) {
        return;
      }

      const text = sel.toString().trim();
      if (!text) return;

      const rects = range.getClientRects();
      const firstRect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();
      setSelection({ text, rect: firstRect });
    }

    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setSelection(null);
    }

    function handleScroll() {
      setSelection(null);
    }

    container.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("scroll", handleScroll, true);

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("scroll", handleScroll, true);
    };
  }, [containerRef, clear]);

  return { selection, clear, setPopoverRef };
}
