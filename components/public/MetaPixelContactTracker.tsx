"use client";

import { useEffect, useRef } from "react";
import { trackPixel } from "@/lib/meta-pixel";

// A second tap on the same link within this window is the same intent, not a
// second contact — dropping it keeps one action to one event.
const REPEAT_MS = 2000;

/**
 * Fires "Contact" when a visitor takes a direct contact action: tapping a call,
 * WhatsApp or email link anywhere on the public site. Delegated from document
 * so every CTA is covered without wiring each page, and mounted in the public
 * layout only — admin staff dialling a lead is not a contact event.
 */
export function MetaPixelContactTracker() {
  const last = useRef<{ href: string; at: number } | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;

      const href = (e.target as HTMLElement)?.closest?.("a")?.getAttribute("href");
      if (!href) return;

      const method = contactMethod(href);
      if (!method) return;

      const at = Date.now();
      if (last.current?.href === href && at - last.current.at < REPEAT_MS) return;
      last.current = { href, at };

      trackPixel("Contact", { content_category: method });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

function contactMethod(href: string): string | null {
  if (href.startsWith("tel:")) return "Phone Call";
  if (href.startsWith("mailto:")) return "Email";
  if (/^https?:\/\/(wa\.me|(api|web|chat)\.whatsapp\.com)\//i.test(href)) return "WhatsApp";
  return null;
}
