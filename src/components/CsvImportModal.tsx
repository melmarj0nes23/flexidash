"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { bulkImportTransactionsAction, updateCustomFieldsAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface CsvImportModalProps {
  isExpense: boolean;
  customFields: { name: string; type: string }[];
}

export default function CsvImportModal({ isExpense, customFields }: CsvImportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mapping state: destinationField -> sourceCsvColumn
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // State to track which unmapped CSV columns the user wants to auto-create as new Custom Fields
  const [autoCreateFields, setAutoCreateFields] = useState<string[]>([]);

  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndParse(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndParse(e.target.files[0]);
    }
  };

  const validateAndParse = (uploadedFile: File) => {
    if (!uploadedFile) return;
    if (uploadedFile.type !== "text/csv" && !uploadedFile.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }
    if (uploadedFile.size > 1 * 1024 * 1024) { // 1MB limit
      setError("File exceeds 1MB limit. Please split it into smaller files.");
      return;
    }
    
    setFile(uploadedFile);
    setAutoCreateFields([]); // Reset
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          setError("No headers found in the CSV.");
          return;
        }
        setHeaders(results.meta.fields);
        setParsedData(results.data);
        
        // Auto-map if possible
        const newMapping: Record<string, string> = {};
        const lowerHeaders = results.meta.fields.map(h => h.toLowerCase());
        
        ['date', 'description', 'amount'].forEach(core => {
          const match = results.meta.fields!.find(h => h.toLowerCase().includes(core));
          if (match) newMapping[core] = match;
        });

        customFields.forEach(f => {
          const match = results.meta.fields!.find(h => h.toLowerCase() === f.name.toLowerCase());
          if (match) newMapping[f.name] = match;
        });

        setMapping(newMapping);
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
      }
    });
  };

  const handleAutoCreateChange = (header: string, checked: boolean) => {
    if (checked) {
      setAutoCreateFields([...autoCreateFields, header]);
    } else {
      setAutoCreateFields(autoCreateFields.filter(f => f !== header));
    }
  };

  const handleImport = async () => {
    if (!mapping.date || !mapping.description || !mapping.amount) {
      setError("Please map Date, Description, and Amount fields.");
      return;
    }

    setIsUploading(true);
    setError(null);

    // 1. Auto-create any new global custom fields if selected
    if (autoCreateFields.length > 0) {
      try {
        const existingFieldNames = customFields.map(f => f.name);
        const newFieldNames = autoCreateFields.filter(f => !existingFieldNames.includes(f));
        if (newFieldNames.length > 0) {
          const updatedGlobalFields = [...existingFieldNames, ...newFieldNames];
          await updateCustomFieldsAction(updatedGlobalFields);
        }
      } catch (err: any) {
        setError("Failed to create new custom fields: " + err.message);
        setIsUploading(false);
        return;
      }
    }

    // 2. Parse and map transactions
    const txsToImport = parsedData.map(row => {
      const amountStr = String(row[mapping.amount] || "0");
      let amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
      if (isNaN(amount)) amount = 0;
      
      // Ensure absolute value first, then negate if expense
      amount = Math.abs(amount);
      if (isExpense && amount > 0) amount = -amount;

      // Parse Date
      const dateStr = row[mapping.date];
      let createdAtStr = new Date().toISOString();
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          createdAtStr = d.toISOString();
        }
      }

      const extraData: Record<string, string> = {};
      
      // Add existing mapped custom fields
      customFields.forEach(f => {
        if (mapping[f.name]) {
          extraData[f.name] = String(row[mapping[f.name]] || "");
        }
      });

      // Add newly auto-created custom fields
      autoCreateFields.forEach(header => {
        extraData[header] = String(row[header] || "");
      });

      return {
        manualProductName: String(row[mapping.description] || "Imported Transaction").substring(0, 255),
        priceCharged: amount,
        extraData,
        createdAt: createdAtStr
      };
    });

    try {
      await bulkImportTransactionsAction(txsToImport);
      setIsOpen(false);
      setFile(null);
      setParsedData([]);
      setMapping({});
      setAutoCreateFields([]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to import");
    } finally {
      setIsUploading(false);
    }
  };

  // Find headers that are NOT currently mapped
  const mappedCsvColumns = Object.values(mapping);
  const unmappedHeaders = headers.filter(h => !mappedCsvColumns.includes(h));

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium bg-white dark:bg-[#1b1d22] border border-gray-200 dark:border-[#2a2c33] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#22242a] rounded-md shadow-sm transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import CSV
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white dark:bg-[#1b1d22] border border-gray-200 dark:border-[#2a2c33] rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-[#2a2c33] flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import CSV</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900/30 text-sm">
                  {error}
                </div>
              )}

              {!file ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-[#2a2c33] rounded-lg p-12 text-center hover:bg-gray-50 dark:hover:bg-[#22242a] transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">CSV files up to 1MB</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-[#22242a] p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{parsedData.length} valid rows found</p>
                    </div>
                    <button onClick={() => { setFile(null); setParsedData([]); setAutoCreateFields([]); }} className="text-sm text-red-500 hover:text-red-600 font-medium">
                      Change File
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Map Columns</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Match your CSV columns to the system fields.</p>
                    
                    <div className="space-y-3">
                      {[
                        { key: "date", label: "Date", required: true },
                        { key: "description", label: "Description", required: true },
                        { key: "amount", label: "Amount", required: true },
                        ...customFields.map(f => ({ key: f.name, label: f.name, required: false }))
                      ].map(field => (
                        <div key={field.key} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-white dark:bg-[#1b1d22] border border-gray-200 dark:border-[#2a2c33] rounded-lg">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                          </span>
                          <select
                            value={mapping[field.key] || ""}
                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                            className="w-full md:w-64 p-2 text-sm bg-gray-50 dark:bg-[#121417] border border-gray-300 dark:border-[#2a2c33] rounded-md focus:outline-none focus:border-[#19c985] dark:text-white"
                          >
                            <option value="">-- Ignore / Not present --</option>
                            {headers.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {unmappedHeaders.length > 0 && (
                    <div className="pt-6 border-t border-gray-100 dark:border-[#2a2c33]">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#19c985]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Auto-Create Custom Fields
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We found extra columns in your CSV. Select any columns you want to automatically add as global Custom Fields in FlexiDash.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unmappedHeaders.map(header => (
                          <label key={header} className="flex items-center p-3 bg-gray-50 dark:bg-[#121417] border border-gray-200 dark:border-[#2a2c33] rounded-lg cursor-pointer hover:border-[#19c985] transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-[#19c985] rounded border-gray-300 focus:ring-[#19c985]"
                              checked={autoCreateFields.includes(header)}
                              onChange={(e) => handleAutoCreateChange(header, e.target.checked)}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{header}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {file && (
              <div className="p-6 border-t border-gray-100 dark:border-[#2a2c33] bg-gray-50 dark:bg-[#121417] flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#22242a] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImport}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-bold bg-[#19c985] text-[#121417] hover:bg-[#16b376] rounded-md transition-colors flex items-center disabled:opacity-50"
                >
                  {isUploading ? "Importing..." : `Import ${parsedData.length} Rows`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
