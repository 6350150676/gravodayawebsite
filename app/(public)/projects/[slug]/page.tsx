import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import {
  getProjectBySlug,
  getProjectSlugRedirect,
  getPropertiesByProject,
  getAllProjectSlugs,
} from "@/lib/queries/projects";
import { getCategories } from "@/lib/queries/properties";
import { getSiteSettings } from "@/lib/queries/site-content";
import { PropertyGallery } from "@/components/public/PropertyGallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { ProjectAbout } from "@/components/public/project/ProjectAbout";
import { ProjectAmenities } from "@/components/public/project/ProjectAmenities";
import { ProjectCTA } from "@/components/public/project/ProjectCTA";
import { ProjectHighlights } from "@/components/public/project/ProjectHighlights";
import { ProjectHeroCard } from "@/components/public/project/ProjectHeroCard";
import { ProjectInquirySection } from "@/components/public/project/ProjectInquirySection";
import { ProjectKeySpecs } from "@/components/public/project/ProjectKeySpecs";
import { ProjectLocationAdvantages } from "@/components/public/project/ProjectLocationAdvantages";
import { ProjectPaymentPlan } from "@/components/public/project/ProjectPaymentPlan";
import { ProjectSectionNav } from "@/components/public/project/ProjectSectionNav";
import { SectionHeading } from "@/components/public/project/SectionHeading";
import { parseProjectContent } from "@/lib/project-content";
import { formatPriceRange } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAllProjectSlugs()).map(({ slug }) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function imageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/project-images/${path}`;
}

// One short paragraph for the hero and for meta descriptions. The admin's
// dedicated overview wins; failing that we fall back through the fields that
// have always existed, so a project written before this page existed still
// reads like it was written for it.
function summarise(project: {
  overview?: string | null;
  tagline: string | null;
  description: string;
}): string {
  const overview = project.overview?.trim();
  if (overview) return overview;
  if (project.tagline?.trim()) return project.tagline.trim();

  // Skip the ALL-CAPS section headers and bullet lines the description often
  // opens with — they make a terrible summary.
  const prose = project.description
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 60 && !l.startsWith("- ") && l !== l.toUpperCase());

  return prose ?? project.description.slice(0, 200);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };

  const sorted = [...project.images].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );
  const images = sorted.slice(0, 4).map((i) => imageUrl(i.storage_path));

  const place = [project.location, project.city?.name].filter(Boolean).join(", ");
  const price = formatPriceRange(project.price_min, project.price_max);
  const description = [summarise(project), place && `Located in ${place}.`, price && `Price: ${price}.`]
    .filter(Boolean)
    .join(" ")
    .slice(0, 158);

  const title = place ? `${project.name} — ${place}` : project.name;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/projects/${slug}`,
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // A slug that matches nothing may be one this project was renamed away from —
  // send those to the current URL (301) rather than 404ing an already-shared link.
  if (!project) {
    const movedTo = await getProjectSlugRedirect(slug);
    if (movedTo) permanentRedirect(`/projects/${movedTo}`);
  }

  if (!project || project.status !== "active") notFound();

  const [units, settings, allCategories] = await Promise.all([
    getPropertiesByProject(project.id),
    getSiteSettings(),
    getCategories(),
  ]);

  // Per-project contact details win; otherwise the site-wide ones.
  const phoneDisplay = project.contact_phone?.trim() || settings.phone_display;
  const phoneTel = project.contact_phone?.trim() || settings.phone_tel;
  const whatsapp = project.contact_whatsapp?.trim() || settings.whatsapp_number;

  const sorted = [...project.images].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );
  const galleryImages = sorted.map((img, i) => ({
    url: imageUrl(img.storage_path),
    alt: `${project.name} — photo ${i + 1}`,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.garvodayrealty.com";
  const projectUrl = `${siteUrl}/projects/${project.slug}`;
  const priceRange = formatPriceRange(project.price_min, project.price_max);
  const address = [project.location, project.city?.name].filter(Boolean).join(", ");

  const categoryNames = allCategories
    .filter((c) => project.category_ids?.includes(c.id))
    .map((c) => c.name);

  // Every variable-length section of the page, in one place. Each one renders
  // nothing when its list is empty, which is how a project with four highlights
  // and no payment plan lays itself out correctly with no special-casing.
  const { highlights, amenityGroups, locationAdvantages, paymentRows, additionalCharges, keySpecs } =
    parseProjectContent(project);

  // The nav only lists sections that will actually render, so a sparse project
  // gets a short nav instead of links that jump nowhere.
  const navSections = [
    { id: "about", label: "Overview", show: true },
    { id: "highlights", label: "Highlights", show: highlights.length > 0 },
    { id: "amenities", label: "Amenities", show: amenityGroups.length > 0 },
    { id: "location", label: "Location", show: locationAdvantages.length > 0 },
    {
      id: "payment-plan",
      label: "Pricing",
      show: paymentRows.length > 0 || additionalCharges.length > 0 || !!project.payment_plan?.trim(),
    },
    { id: "units", label: "Units", show: units.length > 0 },
    { id: "enquire", label: "Enquire", show: true },
  ]
    .filter((s) => s.show)
    .map(({ id, label }) => ({ id, label }));

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: project.name,
    url: projectUrl,
    description: summarise(project).slice(0, 300),
    image: galleryImages.map((img) => img.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: project.location || undefined,
      addressLocality: project.city?.name ?? "Haridwar",
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
    ...(amenityGroups.length
      ? {
          amenityFeature: amenityGroups.flatMap((g) =>
            g.items.map((item) => ({ "@type": "LocationFeatureSpecification", name: item })),
          ),
        }
      : {}),
    ...(project.price_min || project.price_max
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: project.price_min ?? undefined,
            highPrice: project.price_max ?? undefined,
          },
        }
      : {}),
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
    <div className="min-h-screen bg-(--color-sand) pb-16">
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
        <nav className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-3.5 text-xs text-gray-400 sm:px-6 lg:px-8">
          <Link href="/" className="whitespace-nowrap hover:text-(--color-brand)">
            Home
          </Link>
          <ChevronRight size={13} />
          <Link href="/projects" className="whitespace-nowrap hover:text-(--color-brand)">
            Projects
          </Link>
          <ChevronRight size={13} />
          <span className="truncate font-medium text-gray-600">{project.name}</span>
        </nav>
      </div>

      {/* ════════════ HERO ════════════
          Two columns that end level: the gallery sets the height and the card
          stretches to it. Nothing else on the page is columned, so there is no
          rail left over to sit empty. */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">
          <div className="min-w-0">
            <PropertyGallery images={galleryImages} />
          </div>

          <ProjectHeroCard
            project={project}
            projectUrl={projectUrl}
            priceRange={priceRange}
            categories={categoryNames}
            phoneDisplay={phoneDisplay}
            phoneTel={phoneTel}
            whatsapp={whatsapp}
          />
        </div>

        <ProjectKeySpecs specs={keySpecs} />

        <ProjectSectionNav sections={navSections} />

        {/* ════════════ SECTIONS — full width ════════════ */}
        <div className="mt-12 space-y-16 sm:space-y-20">
          <ProjectAbout
            projectName={project.name}
            overview={project.overview?.trim() || null}
            description={project.description}
            brochureUrl={project.brochure_url}
          />

          <ProjectHighlights highlights={highlights} projectName={project.name} />

          <ProjectAmenities groups={amenityGroups} />

          <ProjectLocationAdvantages items={locationAdvantages} address={address || null} />

          <ProjectPaymentPlan
            rows={paymentRows}
            charges={additionalCharges}
            note={project.payment_note}
            legacyText={project.payment_plan}
          />

          {units.length > 0 && (
            <section className="scroll-mt-44" id="units">
              <SectionHeading
                eyebrow="Available options"
                title={`Units in ${project.name}`}
                lead="Individual homes and plots currently listed in this project."
                icon={Home}
              />
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {units.map((p) => (
                  <PropertyCard key={p.id} property={p} supabaseUrl={SUPABASE_URL} />
                ))}
              </div>
            </section>
          )}

          <ProjectInquirySection
            projectId={project.id}
            projectUrl={projectUrl}
            projectName={project.name}
            phoneDisplay={phoneDisplay}
            phoneTel={phoneTel}
            whatsapp={whatsapp}
          />

          <ProjectCTA
            projectId={project.id}
            projectName={project.name}
            projectUrl={projectUrl}
            phoneDisplay={phoneDisplay}
            phoneTel={phoneTel}
            whatsapp={whatsapp}
          />
        </div>
      </div>
    </div>
  );
}
