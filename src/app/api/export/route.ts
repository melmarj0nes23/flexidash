import { auth } from "@/auth";
import { getTransactions } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let startDate = searchParams.get("start") || undefined;
  let endDate = searchParams.get("end") || undefined;

  if (startDate) startDate = new Date(startDate).toISOString();
  if (endDate) {
    const d = new Date(endDate);
    d.setHours(23, 59, 59, 999);
    endDate = d.toISOString();
  }

  const userId = session.user.id;
  const transactions = await getTransactions(userId, { startDate, endDate });

  if (transactions.length === 0) {
    return new NextResponse("No data to export", { status: 404 });
  }

  // Extract all possible custom fields to dynamically build CSV headers
  const allExtraKeys = new Set<string>();
  transactions.forEach(t => {
    if (t.extra_data) {
      try {
        const extra = JSON.parse(t.extra_data);
        Object.keys(extra).forEach(k => allExtraKeys.add(k));
      } catch (e) {}
    }
  });
  const extraKeysArray = Array.from(allExtraKeys);

  // CSV Headers
  const headers = ["ID", "Date", "Product Name", "Price Charged", ...extraKeysArray];
  
  // CSV Rows
  const rows = transactions.map(t => {
    const productName = t.product_name || t.manual_product_name || "Unknown";
    const date = new Date(t.created_at).toLocaleString();
    
    let extraValues: Record<string, string> = {};
    if (t.extra_data) {
      try {
        extraValues = JSON.parse(t.extra_data);
      } catch (e) {}
    }

    const row = [
      t.id.toString(),
      `"${date}"`,
      `"${productName.replace(/"/g, '""')}"`,
      t.price_charged.toFixed(2),
      ...extraKeysArray.map(k => `"${(extraValues[k] || '').replace(/"/g, '""')}"`)
    ];

    return row.join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="transactions_export.csv"',
    },
  });
}
