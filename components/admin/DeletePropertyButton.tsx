"use client";

import { Button } from "@/components/ui/button";
import { deletePropertyAction } from "@/lib/actions/property.actions";
import { Trash2 } from "lucide-react";

export function DeletePropertyButton({ id }: { id: string }) {
  return (
    <form
      action={deletePropertyAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("Delete this property? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 size={15} />
      </Button>
    </form>
  );
}
