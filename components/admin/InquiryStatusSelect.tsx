"use client";

import { useState, useTransition } from "react";
import { updateInquiryStatusAction } from "@/lib/actions/inquiry.actions";
import type { InquiryStatus } from "@/types/database";

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const colors: Record<InquiryStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

interface Props {
  id: string;
  current: InquiryStatus;
}

export function InquiryStatusSelect({ id, current }: Props) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<InquiryStatus>(current);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as InquiryStatus;
    const prev = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      try {
        await updateInquiryStatusAction(id, next);
      } catch {
        setValue(prev);
        setError("Failed to update — try again");
      }
    });
  }

  return (
    <span className="inline-flex flex-col gap-0.5">
      <select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-medium border rounded-full px-2.5 py-1 outline-none cursor-pointer transition-opacity ${colors[value]} ${isPending ? "opacity-50" : ""}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-red-500 px-1">{error}</span>}
    </span>
  );
}
