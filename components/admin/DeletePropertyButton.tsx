"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deletePropertyAction } from "@/lib/actions/property.actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeletePropertyButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deletePropertyAction(id);
      } catch (e) {
        alert(`Delete failed: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleClick}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </Button>
  );
}
