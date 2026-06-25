"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubmissionStatus } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
}

export async function updateSubmissionStatusAction(
  id: string,
  status: SubmissionStatus,
  adminNotes?: string,
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("seller_submissions")
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/submissions");
}
