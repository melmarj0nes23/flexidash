import { auth } from "@/auth";
import { getProducts, getUserMetadata, getTransactions, getTransactionCount, getUserCurrency } from "@/lib/db";
import DashboardForm from "@/components/DashboardForm";
import SearchBar from "@/components/SearchBar";
import DeleteButton from "@/components/DeleteButton";
import CsvExportButton from "@/components/CsvExportButton";
import CsvImportModal from "@/components/CsvImportModal";
import { logTransactionAction, deleteTransactionAction, updateTransactionAction } from "@/app/actions";
import Link from "next/link";
import { getCurrencySymbol } from "@/lib/currency";
import ReceiptButton from "@/components/ReceiptButton";

export const runtime = "edge";

export default async function EntryPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string, page?: string, query?: string }>
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session!.user!.id as string;
  
  const products = await getProducts(userId);
  const customFields = await getUserMetadata(userId);
  const currentCurrency = await getUserCurrency(userId);
  const currencySymbol = getCurrencySymbol(currentCurrency);

  // Normalize string[] to FieldDef[] for backward compatibility
  const normalizedFields = customFields.map((f: any) => typeof f === 'string' ? { name: f, type: 'text' } : f);

  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const searchQuery = params.query;

  const [transactions, totalCount] = await Promise.all([
    getTransactions(userId, { limit, offset, searchQuery, type: 'income' }),
    getTransactionCount(userId, { searchQuery, type: 'income' })
  ]);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const editId = params.edit ? parseInt(params.edit, 10) : null;
  // If editing, we might need to fetch the specific transaction if it's not in the current page
  let initialData = editId ? transactions.find((t: any) => t.id === editId) : null;
  if (editId && !initialData) {
     const allTxForEdit = await getTransactions(userId, { type: 'income' }); 
     initialData = allTxForEdit.find((t: any) => t.id === editId);
  }

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Entry</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Log new sales transactions and keep track of your revenue.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <CsvImportModal isExpense={false} customFields={normalizedFields} />
          <CsvExportButton />
        </div>
      </header>

      <section className="bg-white dark:bg-[#1b1d22] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {initialData ? "Edit Sale" : "Log Sale"}
        </h3>
        <DashboardForm 
          products={products} 
          customFields={normalizedFields} 
          action={logTransactionAction} 
          updateAction={updateTransactionAction}
          initialData={initialData}
          currencySymbol={currencySymbol}
        />
      </section>

      <section className="bg-white dark:bg-[#1b1d22] rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33] overflow-hidden mt-6">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-[#2a2c33] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sales History</h3>
          <SearchBar />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#121417] border-b border-gray-200 dark:border-[#2a2c33]">
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                {normalizedFields.map((f: any) => (
                  <th key={f.name} className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f.name}</th>
                ))}
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4 + normalizedFields.length} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No sales logged yet. Start logging above!
                  </td>
                </tr>
              ) : (
                transactions.map((t: any) => {
                  const extra = t.extra_data ? JSON.parse(t.extra_data) : {};
                  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                  const formattedDate = new Date(t.created_at).toLocaleDateString('en-US', dateOpts);
                  return (
                    <tr key={t.id} className="border-b border-gray-100 dark:border-[#2a2c33] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-[#121417] transition-colors">
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{formattedDate}</td>
                      <td className="p-4 text-sm text-gray-900 dark:text-white font-bold">{t.manual_product_name || t.product_name}</td>
                      {normalizedFields.map((f: any) => (
                        <td key={f.name} className="p-4 text-sm text-gray-500 dark:text-gray-400">{extra[f.name] || "-"}</td>
                      ))}
                      <td className="p-4 text-sm font-bold text-[#19c985] dark:text-[#19c985] text-right">+{currencySymbol}{t.price_charged.toFixed(2)}</td>
                      <td className="p-4 text-sm text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <ReceiptButton 
                            transaction={t} 
                            currencySymbol={currencySymbol} 
                            isExpense={false} 
                            customFields={normalizedFields} 
                          />
                          <a href={`/sales?edit=${t.id}`} className="text-[#19c985] hover:opacity-80 p-1 rounded transition-colors" title="Edit Sale">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </a>
                          <DeleteButton action={deleteTransactionAction.bind(null, t.id)} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-[#2a2c33] flex items-center justify-between">
            <Link
              href={`/sales?page=${page - 1}`}
              className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-200 dark:border-[#2a2c33] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#22242a] transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Previous
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            <Link
              href={`/sales?page=${page + 1}`}
              className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-200 dark:border-[#2a2c33] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#22242a] transition-colors ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Next
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
