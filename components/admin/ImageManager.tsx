"use client";

import { useState, useTransition } from "react";
import { Star, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  deletePropertyImageAction,
  movePropertyImageAction,
  setCoverImageAction,
} from "@/lib/actions/property.actions";

interface Image {
  id: string;
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
}

interface Props {
  images: Image[];
  propertyId: string;
  supabaseUrl: string;
}

function ImageCard({
  img,
  propertyId,
  supabaseUrl,
  canMoveEarlier,
  canMoveLater,
}: {
  img: Image;
  propertyId: string;
  supabaseUrl: string;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
}) {
  const [isCoverPending, startCover] = useTransition();
  const [isDeletePending, startDelete] = useTransition();
  const [isMovePending, startMove] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSetCover() {
    setError(null);
    startCover(async () => {
      try {
        await setCoverImageAction(img.id, propertyId);
      } catch {
        setError("Failed to set cover");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this image?")) return;
    setError(null);
    startDelete(async () => {
      try {
        await deletePropertyImageAction(img.id, img.storage_path, propertyId);
      } catch {
        setError("Failed to delete image");
      }
    });
  }

  function handleMove(direction: -1 | 1) {
    setError(null);
    startMove(async () => {
      try {
        await movePropertyImageAction(img.id, propertyId, direction);
      } catch {
        setError("Failed to move image");
      }
    });
  }

  const isPending = isCoverPending || isDeletePending || isMovePending;

  return (
    <div className="relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${supabaseUrl}/storage/v1/object/public/property-images/${img.storage_path}`}
        alt=""
        className={`w-28 h-24 object-cover rounded-lg border transition-opacity ${isPending ? "opacity-50" : ""}`}
      />
      {img.is_cover && (
        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
          Cover
        </span>
      )}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-white drop-shadow" />
        </div>
      )}
      {!isPending && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-1.5">
          {canMoveEarlier && (
            <button
              type="button"
              title="Move earlier"
              onClick={() => handleMove(-1)}
              className="bg-white text-gray-800 rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronLeft size={13} />
            </button>
          )}
          {!img.is_cover && (
            <button
              type="button"
              title="Set as cover"
              onClick={handleSetCover}
              className="bg-yellow-400 text-black rounded-full p-1.5 hover:bg-yellow-300"
            >
              <Star size={13} />
            </button>
          )}
          <button
            type="button"
            title="Delete image"
            onClick={handleDelete}
            className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
          >
            <Trash2 size={13} />
          </button>
          {canMoveLater && (
            <button
              type="button"
              title="Move later"
              onClick={() => handleMove(1)}
              className="bg-white text-gray-800 rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-500 mt-0.5 w-28 text-center">{error}</p>
      )}
    </div>
  );
}

export function ImageManager({ images, propertyId, supabaseUrl }: Props) {
  if (!images.length) return null;

  // Same order as the public gallery: cover first, then by sort_order. The
  // cover is changed with the star, so only the others get arrows.
  const ordered = [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const firstMovable = ordered.findIndex((img) => !img.is_cover);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-800 mb-1">Manage Images</h2>
      <p className="text-xs text-gray-400 mb-3">
        Shown in this order on the listing. Hover a photo to reorder, set it as the cover or delete it.
        Add new photos at the bottom of the form.
      </p>
      <div className="flex flex-wrap gap-3">
        {ordered.map((img, i) => (
          <ImageCard
            key={img.id}
            img={img}
            propertyId={propertyId}
            supabaseUrl={supabaseUrl}
            canMoveEarlier={!img.is_cover && i > firstMovable}
            canMoveLater={!img.is_cover && i < ordered.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
