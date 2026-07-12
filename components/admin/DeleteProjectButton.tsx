"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/lib/actions/project.actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteProjectButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this project? Linked properties will be unlinked, not deleted. This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteProjectAction(id);
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
