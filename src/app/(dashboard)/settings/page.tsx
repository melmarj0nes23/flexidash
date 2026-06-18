import { auth } from "@/auth";
import { getProducts, getUserMetadata, getUserCurrency, getUserBudgets } from "@/lib/db";
import { createProductAction, deleteProductAction, updateCustomFieldsAction, updateBudgetsAction } from "@/app/actions";
import SettingsForms from "@/components/SettingsForms";
import CurrencySelector from "@/components/CurrencySelector";
import BudgetGoalsForm from "@/components/BudgetGoalsForm";
import { getCurrencySymbol } from "@/lib/currency";


export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const products = await getProducts(userId);
  const customFields = await getUserMetadata(userId);
  const currentCurrency = await getUserCurrency(userId);
  const budgets = await getUserBudgets(userId);
  const currencySymbol = getCurrencySymbol(currentCurrency);

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Catalog & Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your product catalog, financial goals, and tracking fields.</p>
        </div>
        <CurrencySelector currentCurrency={currentCurrency} />
      </div>

      <BudgetGoalsForm 
        initialSalesGoal={budgets.monthlySalesGoal}
        initialExpenseBudget={budgets.monthlyExpenseBudget}
        updateBudgetsAction={updateBudgetsAction}
        currencySymbol={currencySymbol}
      />

      <SettingsForms 
        products={products} 
        customFields={customFields}
        createProductAction={createProductAction}
        deleteProductAction={deleteProductAction}
        updateCustomFieldsAction={updateCustomFieldsAction}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
