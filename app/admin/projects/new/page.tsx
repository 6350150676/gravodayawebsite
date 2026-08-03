import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createProjectAction } from "@/lib/actions/project.actions";
import { getCities, getCategories } from "@/lib/queries/properties";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Project — Admin" };

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [cities, categories] = await Promise.all([getCities(), getCategories()]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Project</h1>
      <ProjectForm action={createProjectAction} cities={cities} categories={categories} />
    </div>
  );
}
