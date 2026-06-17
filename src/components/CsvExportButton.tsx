"use client";

import { useState } from "react";

export default function CsvExportButton() {
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const downloadUrl = (startDate && endDate && showDates) 
    ? `/api/export?start=${startDate}&end=${endDate}`
    : `/api/export`;

  return (
    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button 
          onClick={() => setShowDates(!showDates)}
          className={`px-3 py-2 rounded-md font-medium text-sm border transition-colors flex items-center justify-center ${showDates ? 'bg-gray-200 dark:bg-[#22242a] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white' : 'bg-gray-100 dark:bg-[#1b1d22] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2a2c33] hover:bg-gray-200 dark:hover:bg-[#22242a]'}`}
          title="Filter export by date"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </button>
        <a href={downloadUrl} className="w-full md:w-auto justify-center bg-[#19c985] text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download CSV
        </a>
      </div>
      {showDates && (
        <div className="flex items-center gap-2 bg-white dark:bg-[#1b1d22] p-1.5 rounded-md border border-gray-300 dark:border-[#2a2c33] shadow-sm animate-in fade-in slide-in-from-top-2 w-full md:w-auto">
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none px-1 w-full"
          />
          <span className="text-gray-500 text-sm">-</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none px-1 w-full"
          />
        </div>
      )}
    </div>
  );
}
