"use client";

import { useTransition } from "react";
import { updateInquiryStatusAction } from "@/lib/actions/inquiry.actions";
import type { InquiryStatus } from "@/types/database";

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

interface Props {
  id: string;
  current: InquiryStatus;
}

export function InquiryStatusSelect({ id, current }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as InquiryStatus;
    startTransition(() => updateInquiryStatusAction(id, next));
  }

  const colors: Record<InquiryStatus, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    closed: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium border rounded-full px-2.5 py-1 outline-none cursor-pointer transition-opacity ${colors[current]} ${isPending ? "opacity-50" : ""}`}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
