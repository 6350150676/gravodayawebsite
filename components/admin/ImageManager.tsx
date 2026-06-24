"use client";

import { Star, Trash2 } from "lucide-react";
import { deletePropertyImageAction, setCoverImageAction } from "@/lib/actions/property.actions";

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

export function ImageManager({ images, propertyId, supabaseUrl }: Props) {
  if (!images.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="font-semibold text-gray-800 mb-3">Manage Images</h2>
      <div className="flex flex-wrap gap-3">
        {[...images]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => (
            <div key={img.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${supabaseUrl}/storage/v1/object/public/property-images/${img.storage_path}`}
                alt=""
                className="w-28 h-24 object-cover rounded-lg border"
              />
              {img.is_cover && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
                {!img.is_cover && (
                  <form action={setCoverImageAction.bind(null, img.id, propertyId)}>
                    <button
                      type="submit"
                      title="Set as cover"
                      className="bg-yellow-400 text-black rounded-full p-1.5 hover:bg-yellow-300"
                    >
                      <Star size={13} />
                    </button>
                  </form>
                )}
                <form
                  action={deletePropertyImageAction.bind(null, img.id, img.storage_path, propertyId)}
                  onSubmit={(e) => {
                    if (!confirm("Delete this image?")) e.preventDefault();
                  }}
                >
                  <button
                    type="submit"
                    title="Delete image"
                    className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
