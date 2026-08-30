import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
import { ProjectRichText } from "@/components/public/ProjectRichText";
import { ProjectAmenities } from "@/components/public/project/ProjectAmenities";
import { ProjectHighlightStrip } from "@/components/public/project/ProjectHighlightStrip";
import { ProjectInquiryPanel } from "@/components/public/project/ProjectInquiryPanel";
import { ProjectLocationAdvantages } from "@/components/public/project/ProjectLocationAdvantages";
import { ProjectPaymentPlan } from "@/components/public/project/ProjectPaymentPlan";
import { ProjectPromoCard } from "@/components/public/project/ProjectPromoCard";
import { ProjectTitleBlock } from "@/components/public/project/ProjectTitleBlock";
import { SubHeading } from "@/components/public/project/SubHeading";
import { parseProjectContent, splitDescription } from "@/lib/project-content";
import { deriveLegacyContent } from "@/lib/project-legacy-content";
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

  const categoryNames = allCategories
    .filter((c) => project.category_ids?.includes(c.id))
    .map((c) => c.name);

  // Every variable-length section of the page, in one place. Each one renders
  // nothing when its list is empty, which is how a project with four highlights
  // and no payment plan lays itself out correctly with no special-casing.
  const structured = parseProjectContent(project);

  // A project entered before these sections existed has all of them empty, and
  // its content sitting in the two free-text fields instead. Rather than show
  // that project a plain wall of text, read the sections out of the text it
  // already has — the same rules scripts/backfill-project-content.mjs uses to
  // write them into the database permanently.
  //
  // The admin panel stays the source of truth: fill in any of the description
  // sections and this stops deriving them, and the same goes separately for the
  // payment plan, so structuring one doesn't disturb the other.
  const legacy = deriveLegacyContent(project);

  const usesLegacyText =
    structured.highlights.length === 0 &&
    structured.amenityGroups.length === 0 &&
    structured.locationAdvantages.length === 0;
  const usesLegacyPlan =
    structured.paymentRows.length === 0 && structured.additionalCharges.length === 0;

  const { keySpecs } = structured;
  const highlights = usesLegacyText ? legacy.highlights : structured.highlights;
  const amenityGroups = usesLegacyText ? legacy.amenityGroups : structured.amenityGroups;
  const locationAdvantages = usesLegacyText ? legacy.locationAdvantages : structured.locationAdvantages;
  const paymentRows = usesLegacyPlan ? legacy.paymentRows : structured.paymentRows;
  const additionalCharges = usesLegacyPlan ? legacy.additionalCharges : structured.additionalCharges;
  const paymentNote = project.payment_note?.trim() || (usesLegacyPlan ? legacy.paymentNote : "") || null;
  const paymentPlanText = usesLegacyPlan ? legacy.paymentPlanText : project.payment_plan;

  // The description is written as a lead paragraph followed by ALL-CAPS
  // sections. Splitting it lets the highlight strip sit between the two,
  // matching the layout, without asking admins to re-enter anything.
  const split = splitDescription(project.description);
  const lead = (usesLegacyText ? legacy.overview : split.lead) || project.overview?.trim() || "";
  // Whatever was lifted into a section above must not also run as body text.
  const body = usesLegacyText ? legacy.description : split.body;

  // The closing card's photo: prefer one that isn't already the hero cover.
  const promoImage = galleryImages[1]?.url ?? galleryImages[0]?.url ?? null;

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

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        {/* ════════════ HERO ════════════
            Gallery + identity on the left, inquiry + trust on the right. The
            two columns come out level because the title block balances the
            trust card — neither side ends early and leaves a hole. On a phone
            the grid collapses to one column, so it reads gallery → name and
            price → inquiry form, which is the order a buyer wants them in. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7">
          <div className="min-w-0">
            <PropertyGallery images={galleryImages} />
            <ProjectTitleBlock
              project={project}
              priceRange={priceRange}
              specs={keySpecs}
              categories={categoryNames}
            />
          </div>

          <ProjectInquiryPanel
            project={project}
            projectUrl={projectUrl}
            phoneDisplay={phoneDisplay}
            phoneTel={phoneTel}
            whatsapp={whatsapp}
          />
        </div>

        {/* ════════════ ONE CONTENT CARD ════════════
            Description, highlights, amenities and distances read as a single
            document rather than a stack of separately-titled pages. Each block
            returns null when the admin hasn't filled it in, so the card is as
            long as the project has content and no longer. */}
        <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <section id="about" className="scroll-mt-32">
            <h2 className="text-lg font-bold text-(--color-brand)">About this project</h2>
            {lead && (
              <div className="mt-3">
                <ProjectRichText text={lead} />
              </div>
            )}
          </section>

          <ProjectHighlightStrip highlights={highlights} />

          {body && (
            <div>
              <ProjectRichText text={body} />
            </div>
          )}

          <ProjectAmenities groups={amenityGroups} />

          <ProjectLocationAdvantages items={locationAdvantages} />
        </div>

        {units.length > 0 && (
          <section id="units" className="scroll-mt-32 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <SubHeading>Available Units</SubHeading>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {units.map((p) => (
                <PropertyCard key={p.id} property={p} supabaseUrl={SUPABASE_URL} />
              ))}
            </div>
          </section>
        )}

        {/* ════════════ PAYMENT PLAN ════════════
            A section in its own right rather than a column beside the CTA:
            configurations, the charges that sit on top of them and the fine
            print all need the full width to stay readable, and the block
            removes itself when the admin hasn't entered a plan. */}
        <ProjectPaymentPlan
          rows={paymentRows}
          charges={additionalCharges}
          note={paymentNote}
          legacyText={paymentPlanText}
          phoneDisplay={phoneDisplay}
          phoneTel={phoneTel}
        />

        {/* ════════════ CLOSING CTA ════════════ */}
        <ProjectPromoCard
          project={project}
          projectUrl={projectUrl}
          imageUrl={promoImage}
          subline={project.tagline}
          phoneTel={phoneTel}
        />
      </div>
    </div>
  );
}
