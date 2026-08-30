/**
 * The small uppercase rule-and-label that separates blocks inside the main
 * card — "PROJECT HIGHLIGHTS", "WORLD-CLASS AMENITIES", "LOCATION ADVANTAGE".
 * Deliberately quiet: the page is one dense document, not a stack of separately
 * titled pages, so these mark sections without competing with the project name.
 */
export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b border-gray-200 pb-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-(--color-brand)">
      {children}
    </h2>
  );
}
