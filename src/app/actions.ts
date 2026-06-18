"use server";

import { auth } from "@/auth";
import { addProduct, removeProduct, saveUserMetadata, addTransaction, removeTransaction, updateTransaction } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createProductAction(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  await addProduct(userId, name, price);
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteProductAction(id: number) {
  const userId = await getUserId();
  await removeProduct(userId, id);
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updateCustomFieldsAction(fields: string[]) {
  const userId = await getUserId();
  await saveUserMetadata(userId, fields);
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updateCurrencyAction(currency: string) {
  const userId = await getUserId();
  const { updateUserCurrency } = await import("@/lib/db");
  await updateUserCurrency(userId, currency);
  revalidatePath("/", "layout"); // Revalidate entire app to apply currency change
}

export async function logTransactionAction(formData: FormData) {
  const userId = await getUserId();
  const productIdRaw = formData.get("product_id") as string;
  const isManual = productIdRaw === "manual";
  const productId = isManual ? null : parseInt(productIdRaw, 10);
  const manualProductName = isManual ? (formData.get("manual_product_name") as string) : null;
  
  let priceCharged = parseFloat(formData.get("price") as string);
  const isExpense = formData.get("is_expense") === "true";
  if (isExpense && priceCharged > 0) {
    priceCharged = -priceCharged;
  }
  
  // Extract extra fields dynamically
  const extraData: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("extra_")) {
      const actualKey = key.replace("extra_", "");
      extraData[actualKey] = value as string;
    }
  }

  await addTransaction(userId, productId, manualProductName, priceCharged, extraData);
  revalidatePath("/");
}

export async function deleteTransactionAction(id: number) {
  const userId = await getUserId();
  await removeTransaction(userId, id);
  revalidatePath("/");
}

export async function updateTransactionAction(transactionId: number, formData: FormData) {
  const userId = await getUserId();
  const productIdRaw = formData.get("product_id") as string;
  const isManual = productIdRaw === "manual";
  const productId = isManual ? null : parseInt(productIdRaw, 10);
  const manualProductName = isManual ? (formData.get("manual_product_name") as string) : null;
  
  let priceCharged = parseFloat(formData.get("price") as string);
  const isExpense = formData.get("is_expense") === "true";
  if (isExpense && priceCharged > 0) {
    priceCharged = -priceCharged;
  }
  
  const extraData: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("extra_")) {
      const actualKey = key.replace("extra_", "");
      extraData[actualKey] = value as string;
    }
  }

  await updateTransaction(userId, transactionId, productId, manualProductName, priceCharged, extraData);
  revalidatePath("/");
}

export async function bulkImportTransactionsAction(txs: { manualProductName: string, priceCharged: number, extraData: Record<string, string>, createdAt?: string }[]) {
  const userId = await getUserId();
  const { addTransactionsBulk } = await import("@/lib/db");
  await addTransactionsBulk(userId, txs);
  revalidatePath("/");
}
