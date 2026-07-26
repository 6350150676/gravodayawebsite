import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { ProjectWithRelations } from "@/types";

export function ProjectCard({
  project,
  supabaseUrl,
}: {
  project: ProjectWithRelations;
  supabaseUrl: string;
}) {
  const cover = project.images.find((i) => i.is_cover) ?? project.images[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    >
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${supabaseUrl}/storage/v1/object/public/project-images/${cover.storage_path}`}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
        {project.is_featured && (
          <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-brand)]">
            FEATURED
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors mb-2">
          {project.name}
        </p>
        {project.tagline && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{project.tagline}</p>
        )}
        {(project.location || project.city) && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{[project.location, project.city?.name].filter(Boolean).join(", ")}</span>
          </div>
        )}
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)]">
          View Project <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
