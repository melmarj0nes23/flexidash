"use client";

import { useState, useEffect } from "react";

export type FieldDef = {
  name: string;
  type: "text" | "select";
  options?: string[];
};

export default function DashboardForm({ 
  products, 
  customFields, 
  action, 
  updateAction,
  initialData,
  isExpense 
}: { 
  products: any[], 
  customFields: FieldDef[], 
  action: any,
  updateAction?: any,
  initialData?: any,
  isExpense?: boolean
}) {
  const [selectedPrice, setSelectedPrice] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isManualProduct, setIsManualProduct] = useState(isExpense ? true : false);

  useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.created_at).toISOString().split("T")[0]);
      if (initialData.manual_product_name || isExpense) {
        setIsManualProduct(true);
      } else {
        setIsManualProduct(false);
      }
      setSelectedPrice(initialData.price_charged ? Math.abs(initialData.price_charged).toString() : "");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setIsManualProduct(isExpense ? true : false);
      setSelectedPrice("");
    }
  }, [initialData, isExpense]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "manual") {
      setIsManualProduct(true);
      setSelectedPrice("");
    } else {
      setIsManualProduct(false);
      const id = parseInt(e.target.value, 10);
      const p = products.find(prod => prod.id === id);
      if (p) setSelectedPrice(p.unit_price.toString());
      else setSelectedPrice("");
    }
  };

  const formAction = initialData && updateAction ? updateAction.bind(null, initialData.id) : action;
  const extraDataParsed = initialData?.extra_data ? JSON.parse(initialData.extra_data) : {};

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4 w-full">
      {isExpense && <input type="hidden" name="is_expense" value="true" />}
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label>
        <input 
          type="date" 
          name="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] focus:border-[#19c985] dark:bg-[#121417] dark:border-[#2a2c33] dark:text-white" 
        />
      </div>

      <div className="flex-[2] min-w-[200px]">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {isExpense ? "Category / Vendor" : "Product Name"}
        </label>
        {isManualProduct || isExpense ? (
          <div className="flex gap-2">
             <input type="hidden" name="product_id" value="manual" />
             <input 
               type="text" 
               name="manual_product_name" 
               required
               placeholder={isExpense ? "e.g. Office Supplies" : "Custom product name..."}
               defaultValue={initialData?.manual_product_name || ""}
               className="w-full p-2 border border-[#19c985] bg-green-50 dark:bg-[#121417] rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] dark:text-white" 
             />
             {!isExpense && <button type="button" onClick={() => setIsManualProduct(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 px-2 text-xl">&times;</button>}
          </div>
        ) : (
          <select 
            name="product_id" 
            onChange={handleProductChange} 
            required 
            defaultValue={initialData?.product_id || ""}
            className="w-full p-2 border rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] focus:border-[#19c985] dark:bg-[#121417] dark:border-[#2a2c33] dark:text-white"
          >
            <option value="" disabled>Select product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.product_name}</option>
            ))}
            <option value="manual" className="font-bold text-[#19c985]">+ Manual Entry...</option>
          </select>
        )}
      </div>

      <div className="flex-[1] min-w-[120px]">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">$</span>
          <input 
            type="number" 
            name="price" 
            step="0.01" 
            required 
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="w-full pl-6 p-2 border rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] focus:border-[#19c985] dark:bg-[#121417] dark:border-[#2a2c33] dark:text-white" 
          />
        </div>
      </div>

      {customFields.map(f => (
        <div key={f.name} className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{f.name}</label>
          {f.type === "select" && f.options ? (
            <select name={`extra_${f.name}`} defaultValue={extraDataParsed[f.name] || ""} className="w-full p-2 border rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] focus:border-[#19c985] dark:bg-[#121417] dark:border-[#2a2c33] dark:text-white">
              {f.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
             <input 
                type="text" 
                name={`extra_${f.name}`} 
                placeholder={f.name}
                defaultValue={extraDataParsed[f.name] || ""}
                className="w-full p-2 border rounded-md text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985] focus:border-[#19c985] dark:bg-[#121417] dark:border-[#2a2c33] dark:text-white" 
              />
          )}
        </div>
      ))}

      <div className="min-w-[100px] flex gap-2">
        <button type="submit" className="flex-1 bg-[#19c985] text-[#121417] py-2 px-4 rounded-md text-sm font-bold hover:opacity-90 transition shadow-sm h-[38px]">
          {initialData ? "Update" : "+ Add Row"}
        </button>
        {initialData && (
          <a href="/entry" className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-bold hover:opacity-90 transition shadow-sm h-[38px]">
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
