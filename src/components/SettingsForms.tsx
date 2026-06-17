"use client";

import { useState } from "react";
import type { FieldDef } from "./DashboardForm";

export default function SettingsForms({ 
  products, 
  customFields, 
  createProductAction, 
  deleteProductAction, 
  updateCustomFieldsAction 
}: any) {
  const initialFields = (customFields || []).map((f: any) => typeof f === 'string' ? { name: f, type: 'text' } : f) as FieldDef[];
  
  const [fields, setFields] = useState<FieldDef[]>(initialFields);
  
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "select">("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const handleSaveField = () => {
    const name = newFieldName.trim();
    if (!name) return;
    
    // Duplicate check
    if (fields.find(f => f.name.toLowerCase() === name.toLowerCase() && f.name !== isEditing)) {
      return;
    }

    const newField: FieldDef = {
      name,
      type: newFieldType,
      ...(newFieldType === 'select' ? { options: newFieldOptions.split(',').map(s => s.trim()).filter(Boolean) } : {})
    };

    let updated;
    if (isEditing) {
      updated = fields.map(f => f.name === isEditing ? newField : f);
    } else {
      updated = [...fields, newField];
    }

    setFields(updated);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setIsEditing(null);
    updateCustomFieldsAction(updated);
  };

  const handleEditField = (f: FieldDef) => {
    setNewFieldName(f.name);
    setNewFieldType(f.type);
    setNewFieldOptions(f.options ? f.options.join(", ") : "");
    setIsEditing(f.name);
  };

  const handleRemoveField = (fieldName: string) => {
    const updated = fields.filter(f => f.name !== fieldName);
    setFields(updated);
    updateCustomFieldsAction(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Catalog Section */}
      <section className="bg-white dark:bg-[#1b1d22] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Product Catalog</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your services, packages, and base pricing.</p>
        
        <form action={createProductAction} className="bg-gray-50 dark:bg-[#22242a] p-4 rounded-md border border-gray-200 dark:border-[#2a2c33] mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="e.g., Standard Consultation" 
                required 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121417] rounded text-base md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#19c985]" 
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Base Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">$</span>
                <input 
                  type="number" 
                  name="price" 
                  step="0.01" 
                  placeholder="0.00" 
                  required 
                  className="w-full pl-6 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121417] rounded text-base md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#19c985]" 
                />
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-[#19c985] text-white px-4 py-2 rounded text-base md:text-sm font-medium hover:bg-blue-700 transition h-auto md:h-[38px] whitespace-nowrap">
              + Add to Catalog
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#2a2c33]">
                <th className="p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Base Price</th>
                <th className="p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">No products added yet.</td>
                </tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-[#2a2c33] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-[#121417] dark:hover:bg-gray-800/30">
                    <td className="p-3 text-sm font-bold text-gray-900 dark:text-white">{p.product_name}</td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">${p.unit_price.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => deleteProductAction(p.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Custom Fields Section */}
      <section className="bg-white dark:bg-[#1b1d22] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-[#2a2c33] h-fit">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#19c985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Custom Tracking Fields
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Want to track extra data? Add custom form fields below to attach metadata to transactions.</p>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-2 md:items-end mb-2">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{isEditing ? "Edit Field Name" : "New Field Name"}</label>
              <input 
                type="text" 
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g., Payment Method" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121417] rounded text-base md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#19c985]" 
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select 
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121417] rounded text-base md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#19c985]"
              >
                <option value="text">Text Input</option>
                <option value="select">Dropdown</option>
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                type="button"
                onClick={handleSaveField}
                disabled={!newFieldName.trim()}
                className={`flex-1 md:flex-none ${isEditing ? 'bg-[#19c985] text-white px-4' : 'bg-gray-100 dark:bg-[#22242a] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-4'} py-2 rounded text-base md:text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:text-white dark:hover:text-white transition h-auto md:h-[38px] disabled:opacity-50`}
              >
                {isEditing ? 'Save' : '+ Add Field'}
              </button>
              {isEditing && (
                 <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(null);
                      setNewFieldName("");
                      setNewFieldOptions("");
                      setNewFieldType("text");
                    }} 
                    className="flex-1 md:flex-none bg-gray-200 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-base md:text-sm font-medium hover:bg-gray-300 transition h-auto md:h-[38px]"
                 >
                   Cancel
                 </button>
              )}
            </div>
          </div>
          {newFieldType === 'select' && (
            <div className="mt-2">
               <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dropdown Options (comma separated)</label>
               <textarea 
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Cash, Credit Card, Bank Transfer"
                  className="w-full p-2 border border-gray-300 dark:border-[#2a2c33] rounded text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-[#19c985]"
                  rows={2}
               />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Active Extra Fields</h3>
          <div className="space-y-2">
            {fields.length === 0 && <div className="text-gray-500 dark:text-gray-400 text-sm">No custom fields configured.</div>}
            {fields.map(f => (
              <div key={f.name} className="flex items-center justify-between bg-gray-50 dark:bg-[#121417] border border-gray-200 dark:border-[#2a2c33] p-3 rounded-md">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-3 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block">{f.name}</span>
                    {f.type === 'select' && f.options && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">Options: {f.options.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleEditField(f)}
                    className="text-gray-400 hover:text-[#19c985] transition p-1 mr-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleRemoveField(f.name)}
                    className="text-gray-400 hover:text-red-600 transition p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
