import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectImageManager } from "@/components/admin/ProjectImageManager";
import { updateProjectAction } from "@/lib/actions/project.actions";
import { getProjectById } from "@/lib/queries/projects";
import { getCities } from "@/lib/queries/properties";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Project — Admin" };

interface Props { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [project, cities] = await Promise.all([
    getProjectById(id),
    getCities(),
  ]);

  if (!project) notFound();

  const boundUpdate = updateProjectAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h1>

      <ProjectImageManager
        images={project.images}
        projectId={id}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      />

      <ProjectForm
        action={boundUpdate}
        project={project}
        cities={cities}
      />
    </div>
  );
}
