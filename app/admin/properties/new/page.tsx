import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { createPropertyAction } from "@/lib/actions/property.actions";
import { getCities, getCategories, getLocalitiesByCity } from "@/lib/queries/properties";
import { getProjects } from "@/lib/queries/projects";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Property — Admin" };

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [categories, cities, projects] = await Promise.all([getCategories(), getCities(), getProjects()]);
  // Load all localities; form filters client-side by selected city
  const allLocalities = await Promise.all(
    cities.map((c) => getLocalitiesByCity(c.id))
  ).then((arrays) => arrays.flat());

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Property</h1>
      <PropertyForm
        action={createPropertyAction}
        categories={categories}
        cities={cities}
        localities={allLocalities}
        projects={projects}
      />
    </div>
  );
}
