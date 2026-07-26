import type { Metadata } from "next";
import { getProjects } from "@/lib/queries/projects";
import { ProjectCard } from "@/components/public/ProjectCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore our residential colony and villa projects in Haridwar and around Uttarakhand.",
  alternates: { canonical: "/projects" },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="bg-[var(--color-sand)] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-2">
          Our Projects
        </p>
        <h1 className="text-3xl font-bold text-[var(--color-brand)] mb-8">
          Colony &amp; Villa Projects
        </h1>

        {projects.length === 0 ? (
          <p className="text-gray-400">No projects available right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} supabaseUrl={SUPABASE_URL} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
