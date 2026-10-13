"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "@/components/Loader";

// Uses the native <dialog> so focus trapping, Esc to close and the backdrop come for free.
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel();
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
        <p className="mt-2 break-words text-sm text-zinc-600">{message}</p>
      </div>
      <div className="flex justify-end gap-2 rounded-b-xl bg-zinc-50 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Spinner className="h-4 w-4 !text-white" />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
