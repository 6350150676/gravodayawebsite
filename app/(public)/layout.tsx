import type { ReactNode } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { IntroGate } from "@/components/public/IntroGate";
import { getSiteSettings } from "@/lib/queries/site-content";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <IntroGate />
      <Navbar phoneTel={settings.phone_tel} phoneDisplay={settings.phone_display} />
      <main>{children}</main>
      <Footer
        phoneTel={settings.phone_tel}
        phoneDisplay={settings.phone_display}
        email={settings.contact_email}
        address={settings.contact_address}
      />
    </>
  );
}
