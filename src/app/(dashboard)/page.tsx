import { auth } from "@/auth";
import { getTransactions, getUserCurrency, getUserBudgets } from "@/lib/db";
import { getCurrencySymbol } from "@/lib/currency";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import DateFilter from "@/components/DateFilter";
import BudgetProgressWidgets from "@/components/BudgetProgressWidgets";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AnalyticsOverview({
  searchParams
}: {
  searchParams: Promise<{ range?: string, start?: string, end?: string }>
}) {
  const params = await searchParams;
  const session = await auth();

  const userId = session!.user!.id as string;
  const currentCurrency = await getUserCurrency(userId);
  const currencySymbol = getCurrencySymbol(currentCurrency);
  const budgets = await getUserBudgets(userId);
  
  const cookieStore = await cookies();
  const defaultRange = cookieStore.get("dashboard_date_filter")?.value || "this_month";
  const range = params.range || defaultRange;
  
  let startDate: string | undefined = undefined;
  let endDate: string | undefined = undefined;
  const now = new Date();
  
  if (range === "this_week") {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    startDate = d.toISOString();
  } else if (range === "this_month") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = d.toISOString();
  } else if (range === "this_year") {
    const d = new Date(now.getFullYear(), 0, 1);
    startDate = d.toISOString();
  } else if (range === "custom") {
    if (params.start) startDate = new Date(params.start).toISOString();
    if (params.end) {
      const d = new Date(params.end);
      d.setHours(23, 59, 59, 999);
      endDate = d.toISOString();
    }
  }

  const transactions = await getTransactions(userId, { startDate, endDate });

  // Compute analytics
  let totalIncome = 0;
  let totalExpenses = 0;
  const productStats: Record<string, { units: number, revenue: number, price: number }> = {};
  const paymentStats: Record<string, number> = {};
  const dailyStats: Record<string, { income: number, expense: number }> = {};

  transactions.forEach((t: any) => {
    if (t.price_charged >= 0) {
      totalIncome += t.price_charged;
      
      const pName = t.manual_product_name || t.product_name || "Unknown";
      if (!productStats[pName]) productStats[pName] = { units: 0, revenue: 0, price: t.price_charged };
      productStats[pName].units += 1;
      productStats[pName].revenue += t.price_charged;
  
      let payment = "Other";
      if (t.extra_data) {
         try {
           const extra = JSON.parse(t.extra_data);
           if (extra["Payment Method"]) payment = extra["Payment Method"];
           else if (extra["Payment"]) payment = extra["Payment"];
           else if (extra["Method"]) payment = extra["Method"];
         } catch(e) {}
      }
      paymentStats[payment] = (paymentStats[payment] || 0) + t.price_charged;
    } else {
      totalExpenses += Math.abs(t.price_charged);
    }

    const date = new Date(t.created_at);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    if (!dailyStats[day]) dailyStats[day] = { income: 0, expense: 0 };
    if (t.price_charged >= 0) {
      dailyStats[day].income += t.price_charged;
    } else {
      dailyStats[day].expense += Math.abs(t.price_charged);
    }
  });

  const netProfit = totalIncome - totalExpenses;

  // Calculate current month's totals specifically for the Budget widget
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const currentMonthTransactions = await getTransactions(userId, { startDate: startOfMonth });
  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;
  currentMonthTransactions.forEach((t: any) => {
    if (t.price_charged >= 0) {
      currentMonthIncome += t.price_charged;
    } else {
      currentMonthExpenses += Math.abs(t.price_charged);
    }
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const revenueOverTime = daysOfWeek.map(day => ({
    name: day,
    income: dailyStats[day]?.income || 0,
    expense: dailyStats[day]?.expense || 0
  }));

  const revenueByPayment = Object.keys(paymentStats).map(key => ({
    name: key,
    value: paymentStats[key]
  })).sort((a, b) => b.value - a.value);

  const topProducts = Object.keys(productStats)
    .map(name => ({ name, ...productStats[name] }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalTransactions = transactions.length;
  const topProduct = topProducts.length > 0 ? topProducts[0].name : "N/A";

  return (
    <div className="w-full pb-10 space-y-6">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here is what is happening with your business today.</p>
        </div>
        <DateFilter initialRange={range} initialStart={params.start || ""} initialEnd={params.end || ""} />
      </header>

      {/* Financial Goals & Budgets Widget */}
      {(budgets.monthlySalesGoal > 0 || budgets.monthlyExpenseBudget > 0) && (
        <BudgetProgressWidgets 
          salesGoal={budgets.monthlySalesGoal} 
          expenseBudget={budgets.monthlyExpenseBudget} 
          currentIncome={currentMonthIncome} 
          currentExpenses={currentMonthExpenses} 
          currencySymbol={currencySymbol} 
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-white dark:bg-[#1b1d22] p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Total Income</h3>
            <div className="bg-blue-100 p-1.5 md:p-2 rounded-md text-[#19c985]">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">{currencySymbol}{totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div className="text-xs md:text-sm font-medium text-green-600 flex items-center">
            <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            + Sales
          </div>
        </div>

        <div className="bg-white dark:bg-[#1b1d22] p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Total Expenses</h3>
            <div className="bg-red-100 p-1.5 md:p-2 rounded-md text-red-600">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">{currencySymbol}{totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          <div className="text-xs md:text-sm font-medium text-red-500 flex items-center">
            <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            - Costs
          </div>
        </div>

        <div className="bg-white dark:bg-[#1b1d22] p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Net Profit</h3>
            <div className={`p-1.5 md:p-2 rounded-md ${netProfit >= 0 ? 'bg-[#19c985]/20 text-[#19c985]' : 'bg-red-100 text-red-600'}`}>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className={`text-2xl md:text-3xl font-bold mb-1 md:mb-2 ${netProfit >= 0 ? 'text-[#19c985]' : 'text-red-500'}`}>
            {currencySymbol}{netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
            = Margin
          </div>
        </div>
      </div>

      <AnalyticsCharts revenueOverTime={revenueOverTime} revenueByPayment={revenueByPayment} currencySymbol={currencySymbol} />

      {/* Top Products Table */}
      <div className="bg-white dark:bg-[#1b1d22] rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#2a2c33] flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Products</h3>
          <button className="text-[#19c985] text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#121417] border-b border-gray-200 dark:border-[#2a2c33]">
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Product Name</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Units Sold</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Unit Price</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Total Revenue</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">No product data available yet.</td>
                </tr>
              ) : (
                topProducts.map((p: any, i) => (
                  <tr key={p.name} className="border-b border-gray-100 dark:border-[#2a2c33] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-[#121417] transition-colors">
                    <td className="p-4 text-sm text-gray-900 dark:text-white font-bold flex items-center whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-md mr-4 flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-blue-100 text-blue-600' : i === 1 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-[#22242a] text-gray-500 dark:text-gray-400'}`}>
                        {i === 0 ? (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        ) : i === 1 ? (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        ) : (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      {p.name}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white font-bold text-center whitespace-nowrap">{p.units}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 text-center whitespace-nowrap">{currencySymbol}{p.price.toFixed(2)}</td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">{currencySymbol}{p.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {i % 3 !== 2 ? (
                        <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
