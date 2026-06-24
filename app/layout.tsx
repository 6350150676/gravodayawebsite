import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gravodaya Developers — Premium Properties in Uttarakhand",
    template: "%s | Gravodaya Developers",
  },
  description:
    "Premium apartments, villas, plots and commercial spaces in Dehradun, Haridwar and Rishikesh.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gravodaya.com"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
