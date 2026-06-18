"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReceiptButtonProps {
  transaction: any;
  currencySymbol: string;
  isExpense: boolean;
  customFields: any[];
}

export default function ReceiptButton({ transaction, currencySymbol, isExpense, customFields }: ReceiptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Customization state
  const [businessName, setBusinessName] = useState("FlexiDash");
  const [customerName, setCustomerName] = useState("");
  const [includeDate, setIncludeDate] = useState(true);
  const [includeProduct, setIncludeProduct] = useState(true);
  const [includeCustomFields, setIncludeCustomFields] = useState(true);

  const t = transaction;
  const extra = t.extra_data ? JSON.parse(t.extra_data) : {};
  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = new Date(t.created_at).toLocaleDateString('en-US', dateOpts);
  const productName = t.manual_product_name || t.product_name || "Unknown Product";
  const amount = Math.abs(t.price_charged).toFixed(2);
  const docType = isExpense ? "Expense Receipt" : "Sales Invoice";

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(25, 201, 133); // #19c985
    doc.text(businessName, pageWidth - 14, 22, { align: "right" });
    
    doc.setFontSize(20);
    doc.setTextColor(50, 50, 50);
    doc.text(docType, 14, 22);

    // Metadata
    let yPos = 42;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    if (customerName) {
      doc.text(`Customer/Vendor: ${customerName}`, 14, yPos);
      yPos += 6;
    }
    
    if (includeDate) {
      doc.text(`Date: ${formattedDate}`, 14, yPos);
      yPos += 6;
    }
    
    doc.text(`Transaction ID: #${t.id}`, 14, yPos);
    yPos += 12;

    // Table Data
    const tableBody: string[][] = [];
    
    if (includeProduct) {
      tableBody.push(["Description", productName]);
    }
    
    if (includeCustomFields) {
      customFields.forEach(f => {
        const val = extra[f.name];
        if (val) {
          tableBody.push([f.name, val]);
        }
      });
    }

    // Always include total without currency symbol to prevent font mangling
    tableBody.push(["Total Amount", amount]);

    autoTable(doc, {
      startY: yPos,
      head: [['Details', '']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [25, 201, 133] },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      margin: { top: 10 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || yPos + 20;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, finalY + 15);

    doc.save(`${docType.replace(" ", "_")}_${t.id}.pdf`);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
        className="text-[#19c985] hover:opacity-80 p-1 rounded transition-colors" 
        title="Download Receipt"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#1b1d22] border border-gray-200 dark:border-[#2a2c33] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configure {docType}</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name (Header)</label>
                  <input 
                    type="text" 
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-[#2a2c33] bg-white dark:bg-[#121417] rounded-md text-sm focus:outline-none focus:border-[#19c985] dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer / Vendor Name (Optional)</label>
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2 border border-gray-300 dark:border-[#2a2c33] bg-white dark:bg-[#121417] rounded-md text-sm focus:outline-none focus:border-[#19c985] dark:text-white"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-[#2a2c33] space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={includeDate} onChange={e => setIncludeDate(e.target.checked)} className="rounded text-[#19c985] focus:ring-[#19c985]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Date</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={includeProduct} onChange={e => setIncludeProduct(e.target.checked)} className="rounded text-[#19c985] focus:ring-[#19c985]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Description</span>
                  </label>
                  {customFields.length > 0 && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={includeCustomFields} onChange={e => setIncludeCustomFields(e.target.checked)} className="rounded text-[#19c985] focus:ring-[#19c985]" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Include Custom Fields ({customFields.length})</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-[#121417] border-t border-gray-100 dark:border-[#2a2c33] flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#22242a] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={generatePDF}
                className="px-4 py-2 text-sm font-bold bg-[#19c985] text-[#121417] hover:bg-[#16b376] rounded-md transition-colors flex items-center shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
