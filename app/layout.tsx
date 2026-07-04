import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/public/RouteProgress";

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
                <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
                        <body>
                                <Suspense fallback={null}>
                                        <RouteProgress />
                                </Suspense>
                                {children}
                        </body>
                </html>
        );
}
