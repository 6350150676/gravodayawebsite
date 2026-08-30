interface Props {
  /** Only the sections this project actually has, in page order. */
  sections: { id: string; label: string }[];
}

/**
 * Sticky in-page nav. The page is long by nature — description, highlights,
 * amenities, distances, pricing — and the fix for "too much at once" is not to
 * cut the content but to let people go straight to the part they came for.
 *
 * Plain anchor links: no scroll-spy, no observers, no JavaScript at all. It sits
 * below the 112px navbar, which is why every section carries scroll-mt-44.
 */
export function ProjectSectionNav({ sections }: Props) {
  // One link is not a nav.
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Sections of this project"
      className="sticky top-28 z-30 -mx-4 mt-8 border-b border-gray-200/80 bg-(--color-sand)/95 backdrop-blur-sm sm:-mx-6 lg:-mx-8"
    >
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-(--color-brand) shadow-sm transition-colors hover:border-(--color-brand) hover:bg-(--color-brand) hover:text-white"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
