"use client";

import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function GenerateButton({
  onClick,
  disabled,
  isLoading,
}: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="bg-brand-accent text-text-on-accent hover:bg-brand-accent-hover rounded-standard px-5 py-2 font-sans font-bold"
    >
      {isLoading ? "Generating..." : "Generate"}
    </Button>
  );
}
