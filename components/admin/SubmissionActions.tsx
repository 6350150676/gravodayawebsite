"use client";

import { useState, useTransition } from "react";
import { updateSubmissionStatusAction } from "@/lib/actions/submission.actions";
import type { SubmissionStatus } from "@/types/database";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS: { value: SubmissionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
];

const colors: Record<SubmissionStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  published: "bg-blue-50 text-blue-700 border-blue-200",
};

export function SubmissionActions({
  id,
  currentStatus,
  currentNotes,
}: {
  id: string;
  currentStatus: SubmissionStatus;
  currentNotes: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [open, setOpen] = useState(false);

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SubmissionStatus;
    startTransition(() => updateSubmissionStatusAction(id, next));
  }

  function handleSaveNotes() {
    startTransition(() =>
      updateSubmissionStatusAction(id, currentStatus, notes).then(() => setOpen(false))
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Status dropdown */}
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`text-xs font-medium border rounded-full px-2.5 py-1 outline-none cursor-pointer w-fit transition-opacity ${colors[currentStatus]} ${isPending ? "opacity-50" : ""}`}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Notes toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[var(--color-brand)] hover:underline w-fit"
      >
        {currentNotes ? "Edit notes" : "+ Add notes"}
      </button>

      {open && (
        <div className="mt-1 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes about this submission…"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
          />
          <Button size="sm" onClick={handleSaveNotes} disabled={isPending}>
            {isPending ? <Loader2 size={13} className="animate-spin" /> : "Save"}
          </Button>
        </div>
      )}

      {currentNotes && !open && (
        <p className="text-xs text-gray-500 italic">"{currentNotes}"</p>
      )}
    </div>
  );
}
