import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { updatePropertyAction } from "@/lib/actions/property.actions";
import { getPropertyById, getCities, getCategories, getLocalitiesByCity } from "@/lib/queries/properties";
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

  // bind id as first arg; useActionState will pass (prev, formData) as remaining args
  const boundUpdate = updatePropertyAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h1>

      <ImageManager
        images={property.images}
        propertyId={id}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      />

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
