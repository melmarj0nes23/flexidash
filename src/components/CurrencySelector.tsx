"use client";

import { useTransition } from "react";
import { updateCurrencyAction } from "@/app/actions";
import { currencies } from "@/lib/currency";

export default function CurrencySelector({ currentCurrency }: { currentCurrency: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    startTransition(async () => {
      await updateCurrencyAction(newCurrency);
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="currency-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Currency
      </label>
      <div className="relative">
        <select
          id="currency-select"
          value={currentCurrency}
          onChange={handleCurrencyChange}
          disabled={isPending}
          className="appearance-none bg-white dark:bg-[#1b1d22] border border-gray-300 dark:border-[#2a2c33] text-gray-700 dark:text-gray-300 py-1.5 pl-3 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#19c985] focus:border-transparent disabled:opacity-50 transition-colors"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
