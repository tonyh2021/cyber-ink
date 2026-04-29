"use client";

import { useState, useRef, useEffect } from "react";

class TextStreamAnimator {
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = Date.now();

  public targetText: string = "";
  public currentText: string;

  constructor(
    initialText: string,
    private setText: (text: string) => void,
  ) {
    this.currentText = initialText;
  }

  start() {
    if (this.animationFrameId !== null) return;
    this.lastUpdateTime = Date.now();
    this.animate();
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = () => {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    let timeToConsume = deltaTime;

    const remainingChars = this.targetText.length - this.currentText.length;
    const baseTimePerChar = Math.min(5, 250 / remainingChars);

    let charsToAdd = 0;
    while (timeToConsume >= baseTimePerChar && charsToAdd < remainingChars) {
      charsToAdd++;
      timeToConsume -= baseTimePerChar;
    }

    if (charsToAdd !== remainingChars) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.animationFrameId = null;
    }
    if (charsToAdd === 0) return;

    this.currentText = this.targetText.slice(
      0,
      this.currentText.length + charsToAdd,
    );
    this.lastUpdateTime = currentTime - timeToConsume;
    this.setText(this.currentText);
  };
}

export function useStreamBuffer(source: string, isStreaming: boolean) {
  const [displayedText, setDisplayedText] = useState("");

  const [animator] = useState<TextStreamAnimator>(
    () => new TextStreamAnimator("", setDisplayedText),
  );

  useEffect(() => {
    if (!isStreaming) {
      animator.stop();
      animator.currentText = source;
      animator.targetText = source;
      setDisplayedText(source);
      return;
    }

    if (!source.startsWith(animator.targetText)) {
      animator.currentText = "";
      setDisplayedText("");
    }

    animator.targetText = source;
    animator.start();
  }, [source, isStreaming, animator]);

  useEffect(() => {
    return () => animator.stop();
  }, [animator]);

  const isBuffering =
    isStreaming && displayedText.length < source.length;

  return { displayedText, isBuffering };
}
