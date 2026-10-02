import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { ProjectWithRelations } from "@/types";
import { formatPriceRange } from "@/lib/utils";

/**
 * Full-bleed, image-led project tile for the homepage. The grid cell decides
 * its size; `feature` marks the lead tile, which gets larger type and the tagline.
 */
export function ProjectShowcaseCard({
  project,
  supabaseUrl,
  feature = false,
}: {
  project: ProjectWithRelations;
  supabaseUrl: string;
  feature?: boolean;
}) {
  const cover = project.images.find((i) => i.is_cover) ?? project.images[0];
  const priceRange = formatPriceRange(project.price_min, project.price_max);
  const place = [project.location, project.city?.name].filter(Boolean).join(", ");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative isolate block h-full min-h-[440px] lg:min-h-0 overflow-hidden bg-(--color-forest) text-white"
    >
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${supabaseUrl}/storage/v1/object/public/project-images/${cover.storage_path}`}
          alt={project.name}
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/45 via-45% to-black/0" />

      <div className="flex h-full flex-col justify-end p-6 sm:p-8">
        {place && (
          <p className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.26em] text-white/75">
            <MapPin size={12} className="shrink-0 text-(--color-terracotta-light)" />
            <span className="truncate">{place}</span>
          </p>
        )}
        <h3
          className={`mt-3 font-display font-medium leading-[1.05] text-balance line-clamp-2 ${
            feature ? "text-4xl sm:text-5xl" : "text-[1.85rem]"
          }`}
        >
          {project.name}
        </h3>
        {feature && project.tagline && (
          <p className="mt-3 max-w-md text-sm text-white/70 leading-relaxed line-clamp-2">{project.tagline}</p>
        )}

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/20 pt-5">
          {priceRange ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">Price</p>
              <p className="mt-0.5 font-display text-2xl leading-tight">{priceRange}</p>
            </div>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
            Explore
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition-colors duration-300 group-hover:border-(--color-terracotta) group-hover:bg-(--color-terracotta)">
              <ArrowUpRight size={15} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
