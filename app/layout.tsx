import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/public/RouteProgress";
import { MetaPixel } from "@/components/public/MetaPixel";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://garvoday.com";
const SITE_TITLE = "Garvoday Developers — Premium Properties in Uttarakhand";
const SITE_DESCRIPTION =
        "Premium villas, plots and residential properties in Haridwar.";

export const metadata: Metadata = {
        title: {
                default: SITE_TITLE,
                template: "%s | Garvoday Developers",
        },
        description: SITE_DESCRIPTION,
        metadataBase: new URL(SITE_URL),
        openGraph: {
                type: "website",
                locale: "en_IN",
                url: SITE_URL,
                siteName: "Garvoday Developers",
                title: SITE_TITLE,
                description: SITE_DESCRIPTION,
                images: ["/logo.png"],
        },
        twitter: {
                card: "summary_large_image",
                title: SITE_TITLE,
                description: SITE_DESCRIPTION,
                images: ["/logo.png"],
        },
};

const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Garvoday Developers",
        url: SITE_URL,
        potentialAction: {
                "@type": "SearchAction",
                target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${SITE_URL}/properties?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
        },
};

export default function RootLayout({
        children,
}: {
        children: React.ReactNode;
}) {
        return (
                <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
                        <body>
                                <script
                                        type="application/ld+json"
                                        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                                />
                                <MetaPixel />
                                <Suspense fallback={null}>
                                        <RouteProgress />
                                </Suspense>
                                {children}
                        </body>
                </html>
        );
}
