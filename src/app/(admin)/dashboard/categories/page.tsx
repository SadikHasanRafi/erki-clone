import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { listCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Categories" }]} />
      <h1 className="text-2xl font-bold text-zinc-900">Categories</h1>
      <CategoryManager initial={await listCategories()} />
    </div>
  );
}
