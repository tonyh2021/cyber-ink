"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="w-[420px] rounded-modal bg-surface-card shadow-[0_8px_32px_4px_rgba(0,0,0,0.19)]">
        <div className="px-7 pt-6 pb-4">
          <h2 className="text-[15px] font-bold text-text-primary font-sans">
            {title}
          </h2>
          <p className="text-[13px] text-text-secondary mt-2 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 px-7 py-4 border-t border-border-default">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-[13px] font-bold rounded-standard bg-brand-accent text-text-on-accent hover:bg-brand-accent-hover transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
