import { auth } from "@/auth";
import { getProducts, getUserMetadata } from "@/lib/db";
import { createProductAction, deleteProductAction, updateCustomFieldsAction } from "@/app/actions";
import SettingsForms from "@/components/SettingsForms";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const products = await getProducts(userId);
  const customFields = await getUserMetadata(userId);

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="pb-4">
        <h1 className="text-2xl font-bold dark:text-white">Catalog & Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your product catalog and custom tracking fields.</p>
      </div>

      <SettingsForms 
        products={products} 
        customFields={customFields}
        createProductAction={createProductAction}
        deleteProductAction={deleteProductAction}
        updateCustomFieldsAction={updateCustomFieldsAction}
      />
    </div>
  );
}
