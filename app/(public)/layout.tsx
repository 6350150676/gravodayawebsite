import type { ReactNode } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { DoorAnimation } from "@/components/public/DoorAnimation";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DoorAnimation />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
