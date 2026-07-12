"use client";

import { useState, useTransition } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import { deleteProjectImageAction, setProjectCoverImageAction } from "@/lib/actions/project.actions";

interface Image {
  id: string;
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
}

interface Props {
  images: Image[];
  projectId: string;
  supabaseUrl: string;
}

function ImageCard({
  img,
  projectId,
  supabaseUrl,
}: {
  img: Image;
  projectId: string;
  supabaseUrl: string;
}) {
  const [isCoverPending, startCover] = useTransition();
  const [isDeletePending, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSetCover() {
    setError(null);
    startCover(async () => {
      try {
        await setProjectCoverImageAction(img.id, projectId);
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
        await deleteProjectImageAction(img.id, img.storage_path, projectId);
      } catch {
        setError("Failed to delete image");
      }
    });
  }

  const isPending = isCoverPending || isDeletePending;

  return (
    <div className="relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${supabaseUrl}/storage/v1/object/public/project-images/${img.storage_path}`}
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
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
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
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-500 mt-0.5 w-28 text-center">{error}</p>
      )}
    </div>
  );
}

export function ProjectImageManager({ images, projectId, supabaseUrl }: Props) {
  if (!images.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-800 mb-3">Manage Images</h2>
      <div className="flex flex-wrap gap-3">
        {[...images]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => (
            <ImageCard
              key={img.id}
              img={img}
              projectId={projectId}
              supabaseUrl={supabaseUrl}
            />
          ))}
      </div>
    </div>
  );
}
