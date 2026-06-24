import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { updatePropertyAction, deletePropertyImageAction, setCoverImageAction } from "@/lib/actions/property.actions";
import { getPropertyById, getCities, getCategories, getLocalitiesByCity } from "@/lib/queries/properties";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Property — Admin" };

interface Props { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [property, categories, cities] = await Promise.all([
    getPropertyById(id),
    getCategories(),
    getCities(),
  ]);

  if (!property) notFound();

  const allLocalities = await Promise.all(
    cities.map((c) => getLocalitiesByCity(c.id))
  ).then((arrays) => arrays.flat());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const boundUpdate = updatePropertyAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h1>

      {/* Image management */}
      {property.images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Manage Images</h2>
          <div className="flex flex-wrap gap-3">
            {[...property.images]
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
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">Cover</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
                    {!img.is_cover && (
                      <form action={setCoverImageAction.bind(null, img.id, id)}>
                        <button type="submit" title="Set as cover"
                          className="bg-yellow-400 text-black rounded-full p-1.5 hover:bg-yellow-300">
                          <Star size={13} />
                        </button>
                      </form>
                    )}
                    <form action={deletePropertyImageAction.bind(null, img.id, img.storage_path, id)}>
                      <button type="submit" title="Delete image"
                        className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                        onClick={(e) => { if (!confirm("Delete this image?")) e.preventDefault(); }}>
                        <Trash2 size={13} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <PropertyForm
        action={boundUpdate}
        property={property}
        categories={categories}
        cities={cities}
        localities={allLocalities}
      />
    </div>
  );
}
