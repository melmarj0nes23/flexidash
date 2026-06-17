"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("query", query);
        params.delete("page"); // reset page on new search
      } else {
        params.delete("query");
      }
      router.push(`?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full md:w-64">
      <input
        type="text"
        placeholder="Search transactions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#2a2c33] bg-white dark:bg-[#121417] rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] text-gray-900 dark:text-white"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
    </div>
  );
}
