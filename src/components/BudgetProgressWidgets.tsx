
export default function BudgetProgressWidgets({ salesGoal, expenseBudget, currentIncome, currentExpenses, currencySymbol }: { salesGoal: number, expenseBudget: number, currentIncome: number, currentExpenses: number, currencySymbol: string }) {
  const salesPercent = salesGoal > 0 ? Math.min(100, Math.round((currentIncome / salesGoal) * 100)) : 0;
  const expensePercent = expenseBudget > 0 ? Math.min(100, Math.round((currentExpenses / expenseBudget) * 100)) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
      {salesGoal > 0 && (
        <div className="bg-white dark:bg-[#1b1d22] p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Monthly Sales Goal</h3>
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {currencySymbol}{currentIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-sm font-normal text-gray-400">/ {currencySymbol}{salesGoal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-[#19c985]/20 p-2 rounded-md text-[#19c985]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-[#121417] rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#19c985] h-2.5 rounded-full transition-all duration-1000" style={{ width: `${salesPercent}%` }}></div>
          </div>
          <div className="mt-2 text-xs text-right text-gray-500 dark:text-gray-400 font-medium">
            {salesPercent}% reached
          </div>
        </div>
      )}

      {expenseBudget > 0 && (
        <div className="bg-white dark:bg-[#1b1d22] p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Monthly Expense Budget</h3>
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {currencySymbol}{currentExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-sm font-normal text-gray-400">/ {currencySymbol}{expenseBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            <div className={`p-2 rounded-md ${expensePercent >= 100 ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500" : expensePercent >= 80 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-[#121417] rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ${expensePercent >= 100 ? "bg-red-500" : expensePercent >= 80 ? "bg-yellow-500" : "bg-blue-500"}`} style={{ width: `${expensePercent}%` }}></div>
          </div>
          <div className="mt-2 text-xs text-right text-gray-500 dark:text-gray-400 font-medium">
            {expensePercent >= 100 ? "Budget exceeded" : `${expensePercent}% used`}
          </div>
        </div>
      )}
    </div>
  );
}
