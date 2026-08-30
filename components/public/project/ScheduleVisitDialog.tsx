"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CalendarCheck, X } from "lucide-react";
import { InquiryForm } from "@/components/public/InquiryForm";

interface Props {
  projectId: string;
  projectUrl: string;
  projectName: string;
  phone: string;
  className?: string;
  label?: string;
}

/**
 * "Schedule a Site Visit" opens the real inquiry form with the site-visit box
 * already ticked, so the CTA is a working flow rather than a dead button. It
 * posts through the same server action as every other lead, which is also what
 * fires the existing Lead + Schedule Pixel events — no second form, no second
 * event wiring.
 *
 * Built on the native <dialog> element: it brings the focus trap, Esc-to-close,
 * inertness of the page behind and the ::backdrop for free. A modal library
 * would have been ~12kB of JavaScript on a page whose whole job is to render
 * fast, and this was the only thing on the site using one.
 *
 * The form only mounts while the dialog is open, so the page ships no extra
 * form markup and the fields reset between openings.
 */
export function ScheduleVisitDialog({
  projectId,
  projectUrl,
  projectName,
  phone,
  className = "",
  label = "Schedule a Site Visit",
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  // The page mounts this more than once (mobile actions, sidebar, closing CTA).
  const titleId = useId();

  const close = useCallback(() => {
    ref.current?.close();
    setOpen(false);
  }, []);

  function openDialog() {
    setOpen(true);
    ref.current?.showModal();
  }

  // The page behind must not scroll while the modal is up. <dialog> handles
  // focus and Esc itself; the `close` event covers Esc as well as the button.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={openDialog} className={className}>
        <CalendarCheck size={16} /> {label}
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        // Clicking the backdrop closes; clicks inside the panel stop there.
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
        aria-labelledby={titleId}
        className="w-[calc(100vw-2rem)] max-w-md rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm open:m-auto"
        style={{ maxHeight: "min(90vh, 44rem)" }}
      >
        {open && (
          <div className="max-h-[inherit] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-bold text-(--color-brand) wrap-break-word">
                  Schedule a Site Visit
                </h2>
                <p className="mt-1 text-xs text-gray-400 wrap-break-word">
                  Tell us how to reach you and we&apos;ll confirm a time to walk you through{" "}
                  {projectName}.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-mr-1 shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <InquiryForm
                projectId={projectId}
                projectUrl={projectUrl}
                title={projectName}
                phone={phone}
                defaultVisitIntent
                submitLabel="Request Site Visit"
              />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
