import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Garvoday Developers â€” Premium Properties in Uttarakhand",
    template: "%s | Garvoday Developers",
  },
  description:
    "Premium apartments, villas, plots and commercial spaces in Dehradun, Haridwar and Rishikesh.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://garvoday.com"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
