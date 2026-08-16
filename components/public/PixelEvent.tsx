"use client";

import { useEffect, useRef } from "react";
import { trackPixel, type PixelParams } from "@/lib/meta-pixel";

interface Props {
  event: string;
  params?: PixelParams;
}

/** Fires a Meta Pixel event once when the page mounts (e.g. ViewContent). */
export function PixelEvent({ event, params }: Props) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackPixel(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
