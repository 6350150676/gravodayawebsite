import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { Plus, Pencil } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects — Admin" };

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  city: { name: string } | null;
  images: { storage_path: string; is_cover: boolean }[];
}

export default async function AdminProjectsPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: projectsRaw } = await supabase
    .from("projects")
    .select(`
      id, name, status, is_featured, created_at,
      city:cities(name),
      images:project_images(storage_path, is_cover)
    `)
    .order("created_at", { ascending: false });

  const projects = (projectsRaw ?? []) as unknown as ProjectRow[];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new"><Plus size={16} /> Add Project</Link>
        </Button>
      </div>

      {!projects?.length ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          No projects yet.{" "}
          <Link href="/admin/projects/new" className="text-[var(--color-brand)] font-medium">Add the first one →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Project</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((p) => {
                const cover = p.images?.find((i) => i.is_cover) ?? p.images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${supabaseUrl}/storage/v1/object/public/project-images/${cover.storage_path}`}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.is_featured ? "Featured" : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.city?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/projects/${p.id}/edit`}><Pencil size={15} /></Link>
                        </Button>
                        <DeleteProjectButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.inactive}`}>
      {status}
    </span>
  );
}
