import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} — Gravodaya Developers`,
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <p>Property detail: {slug} — coming soon</p>
    </main>
  );
}
