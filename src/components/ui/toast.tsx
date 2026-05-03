"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CircleAlert, X } from "lucide-react";

type ToastVariant = "warning" | "error";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  variant?: ToastVariant;
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  warning: "bg-warning",
  error: "bg-danger",
};

const variantIcons: Record<ToastVariant, typeof AlertTriangle> = {
  warning: AlertTriangle,
  error: CircleAlert,
};

export function Toast({ message, onDismiss, variant = "error", duration = 5000 }: ToastProps) {
  const [fading, setFading] = useState(false);
  const Icon = variantIcons[variant];

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), duration - 300);
    const dismissTimer = setTimeout(onDismiss, duration);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-[8px] ${variantStyles[variant]} text-white text-sm font-medium shadow-lg max-w-[480px] transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1 min-w-0">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}
