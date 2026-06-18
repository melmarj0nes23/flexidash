"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DateFilter({ 
  initialRange = "this_month", 
  initialStart = "", 
  initialEnd = "" 
}: { 
  initialRange?: string;
  initialStart?: string;
  initialEnd?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || initialRange;
  const startParam = searchParams.get("start") || initialStart;
  const endParam = searchParams.get("end") || initialEnd;

  const [startDate, setStartDate] = useState(startParam);
  const [endDate, setEndDate] = useState(endParam);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    document.cookie = `dashboard_date_filter=${val}; path=/; max-age=31536000`;
    if (val === "custom") {
      router.push(`/?range=custom`);
    } else {
      router.push(`/?range=${val}`);
    }
  };

  const applyCustomDate = () => {
    if (startDate && endDate) {
      document.cookie = `dashboard_date_filter=custom; path=/; max-age=31536000`;
      router.push(`/?range=custom&start=${startDate}&end=${endDate}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
      {currentRange === "custom" && (
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-[#1b1d22] p-1 rounded-md border border-gray-300 dark:border-[#2a2c33] shadow-sm w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none px-2 w-full sm:w-auto"
            />
            <span className="text-gray-500">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none px-2 w-full sm:w-auto"
            />
          </div>
          <button 
            onClick={applyCustomDate}
            className="w-full sm:w-auto bg-[#19c985] text-white px-3 py-1.5 rounded text-xs font-bold mt-2 sm:mt-0"
          >
            Apply
          </button>
        </div>
      )}
      <div className="relative w-full sm:w-auto">
        <select 
          value={currentRange}
          onChange={handleChange}
          className="w-full sm:w-auto appearance-none bg-white dark:bg-[#1b1d22] border border-gray-300 dark:border-[#2a2c33] text-gray-700 dark:text-gray-300 py-2 pl-10 pr-8 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#19c985]"
        >
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}
