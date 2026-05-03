"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TextSelection {
  text: string;
  rect: DOMRect;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLElement | null>(null);

  const clear = useCallback(() => {
    setSelection(null);
  }, []);

  const setPopoverRef = useCallback((el: HTMLElement | null) => {
    popoverRef.current = el;
  }, []);

  const containerCallbackRef = useCallback((el: HTMLElement | null) => {
    setContainer(el);
  }, []);

  useEffect(() => {
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
  }, [container]);

  return { selection, clear, setPopoverRef, containerRef: containerCallbackRef };
}
