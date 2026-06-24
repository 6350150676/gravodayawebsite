import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deletePropertyAction } from "@/lib/actions/property.actions";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Properties — Admin" };

interface PropertyRow {
  id: string;
  title: string;
  price: number;
  status: string;
  is_for_rent: boolean;
  is_featured: boolean;
  created_at: string;
  category: { name: string } | null;
  city: { name: string } | null;
  images: { storage_path: string; is_cover: boolean }[];
}

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: propertiesRaw } = await supabase
    .from("properties")
    .select(`
      id, title, price, status, is_for_rent, is_featured, created_at,
      category:property_categories(name),
      city:cities(name),
      images:property_images(storage_path, is_cover)
    `)
    .order("created_at", { ascending: false });

  const properties = (propertiesRaw ?? []) as unknown as PropertyRow[];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <Button asChild>
          <Link href="/admin/properties/new"><Plus size={16} /> Add Property</Link>
        </Button>
      </div>

      {!properties?.length ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          No properties yet.{" "}
          <Link href="/admin/properties/new" className="text-[var(--color-brand)] font-medium">Add the first one →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {properties.map((p) => {
                const cover = p.images?.find((i) => i.is_cover) ?? p.images?.[0];
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${supabaseUrl}/storage/v1/object/public/property-images/${cover.storage_path}`}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400">
                            {p.is_for_rent ? "Rent" : "Sale"}
                            {p.is_featured ? " · Featured" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.city?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/properties/${p.id}/edit`}><Pencil size={15} /></Link>
                        </Button>
                        <form action={deletePropertyAction.bind(null, p.id)}>
                          <Button type="submit" variant="ghost" size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => { if (!confirm("Delete this property?")) e.preventDefault(); }}>
                            <Trash2 size={15} />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    sold: "bg-blue-100 text-blue-700",
    rented: "bg-purple-100 text-purple-700",
    inactive: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.inactive}`}>
      {status}
    </span>
  );
}
