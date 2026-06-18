"use client";

import { useState } from "react";

interface BudgetGoalsFormProps {
  initialSalesGoal: number;
  initialExpenseBudget: number;
  updateBudgetsAction: (salesGoal: number, expenseBudget: number) => Promise<void>;
  currencySymbol: string;
}

export default function BudgetGoalsForm({ initialSalesGoal, initialExpenseBudget, updateBudgetsAction, currencySymbol }: BudgetGoalsFormProps) {
  const [salesGoal, setSalesGoal] = useState(initialSalesGoal.toString());
  const [expenseBudget, setExpenseBudget] = useState(initialExpenseBudget.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    
    await updateBudgetsAction(parseFloat(salesGoal) || 0, parseFloat(expenseBudget) || 0);
    
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section className="bg-white dark:bg-[#1b1d22] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
      <div className="flex items-center mb-1">
        <svg className="w-5 h-5 mr-2 text-[#19c985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Goals & Budgets</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Set your monthly targets to track progress on your dashboard.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Monthly Sales Goal</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">{currencySymbol}</span>
              <input 
                type="number" 
                value={salesGoal}
                onChange={(e) => setSalesGoal(e.target.value)}
                min="0"
                step="0.01"
                className="w-full pl-8 p-2.5 border border-gray-300 dark:border-[#2a2c33] bg-gray-50 dark:bg-[#121417] rounded text-base md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#19c985]" 
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Monthly Expense Budget</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">{currencySymbol}</span>
              <input 
                type="number" 
                value={expenseBudget}
                onChange={(e) => setExpenseBudget(e.target.value)}
                min="0"
                step="0.01"
                className="w-full pl-8 p-2.5 border border-gray-300 dark:border-[#2a2c33] bg-gray-50 dark:bg-[#121417] rounded text-base md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#19c985]" 
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-2">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-[#19c985] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#16b376] transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Targets"}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-[#19c985] font-medium">Saved successfully!</span>}
        </div>
      </form>
    </section>
  );
}
