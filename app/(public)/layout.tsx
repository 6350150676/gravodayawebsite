import type { ReactNode } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { IntroGate } from "@/components/public/IntroGate";
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <IntroGate />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
