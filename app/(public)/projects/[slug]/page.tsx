import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, FileText, Home } from "lucide-react";
import { getProjectBySlug, getPropertiesByProject } from "@/lib/queries/projects";
import { PropertyGallery } from "@/components/public/PropertyGallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Reveal } from "@/components/public/Reveal";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function imageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/project-images/${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };

  const cover = project.images.find((i) => i.is_cover) ?? project.images[0];
  return {
    title: project.name,
    description: (project.tagline || project.description).slice(0, 155),
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.name,
      description: (project.tagline || project.description).slice(0, 155),
      images: cover ? [imageUrl(cover.storage_path)] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || project.status !== "active") notFound();

  const units = await getPropertiesByProject(project.id);

  const sorted = [...project.images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const galleryImages = sorted.map((img) => ({
    url: imageUrl(img.storage_path),
    alt: project.name,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.garvodayrealty.com";
  const projectUrl = `${siteUrl}/projects/${project.slug}`;

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: project.name,
    url: projectUrl,
    description: (project.tagline || project.description || "").slice(0, 300),
    image: galleryImages.map((img) => img.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: project.location || undefined,
      addressLocality: project.city?.name ?? "Haridwar",
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/projects` },
      { "@type": "ListItem", position: 3, name: project.name, item: projectUrl },
    ],
  };

  return (
    <div className="bg-[var(--color-sand)] min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-[var(--color-brand)] whitespace-nowrap">Home</Link>
          <ChevronRight size={13} />
          <Link href="/projects" className="hover:text-[var(--color-brand)] whitespace-nowrap">Projects</Link>
          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium truncate">{project.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PropertyGallery images={galleryImages} />

        {/* Title block */}
        <div className="mt-6">
          {project.is_featured && (
            <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-brand)] mb-3">
              FEATURED PROJECT
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand)] leading-tight break-words">
            {project.name}
          </h1>
          {project.tagline && (
            <p className="mt-2 text-gray-600 text-base">{project.tagline}</p>
          )}
          {(project.location || project.city) && (
            <p className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
              <MapPin size={15} className="text-[var(--color-gold)]" />
              {[project.location, project.city?.name].filter(Boolean).join(", ")}
            </p>
          )}
          {project.brochure_url && (
            <a
              href={project.brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)] bg-[var(--color-brand)]/5 hover:bg-[var(--color-brand)] hover:text-white px-4 py-2.5 rounded-xl transition-colors"
            >
              <FileText size={15} /> Download Brochure
            </a>
          )}
        </div>

        {/* Description */}
        <Reveal as="section" className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-[var(--color-brand)] mb-3">About this project</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </Reveal>

        {/* Payment plan */}
        {project.payment_plan && (
          <Reveal as="section" className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[var(--color-brand)] mb-3">Payment Plan</h2>
            <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
              {project.payment_plan}
            </p>
          </Reveal>
        )}

        {/* Available units */}
        {units.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-1.5">
                  <Home size={13} /> Available Options
                </p>
                <h2 className="text-2xl font-bold text-[var(--color-brand)]">
                  Units in {project.name}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((p) => (
                <PropertyCard key={p.id} property={p} supabaseUrl={SUPABASE_URL} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
