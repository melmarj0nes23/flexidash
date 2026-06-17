import { createClient } from "@libsql/client";
import { drizzle } from 'drizzle-orm/libsql';
import { userMetadata, products, transactions } from './schema';
import { eq, and, or, desc, gte, lte, count, like } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

export function getDb() {
  return db;
}

export async function getUserMetadata(userId: string) {
  const db = getDb();
  const result = await db.select().from(userMetadata).where(eq(userMetadata.userId, userId)).get();
  if (result && result.customFields) {
    return JSON.parse(result.customFields) as any[];
  }
  return [];
}

export async function saveUserMetadata(userId: string, customFields: any[]) {
  const db = getDb();
  await db.insert(userMetadata)
    .values({ userId, customFields: JSON.stringify(customFields) })
    .onConflictDoUpdate({ target: userMetadata.userId, set: { customFields: JSON.stringify(customFields) } });
}

export async function getUserCurrency(userId: string): Promise<string> {
  const db = getDb();
  const [result] = await db.select({ currency: userMetadata.currency }).from(userMetadata).where(eq(userMetadata.userId, userId)).limit(1);
  return result?.currency || 'USD';
}

export async function updateUserCurrency(userId: string, currency: string) {
  const db = getDb();
  await db.insert(userMetadata)
    .values({ userId, currency })
    .onConflictDoUpdate({ target: userMetadata.userId, set: { currency } });
}

export async function getProducts(userId: string) {
  const db = getDb();
  const res = await db.select().from(products).where(eq(products.userId, userId)).all();
  return res.map(p => ({
    id: p.id,
    product_name: p.productName,
    unit_price: p.unitPrice
  }));
}

export async function addProduct(userId: string, productName: string, unitPrice: number) {
  const db = getDb();
  await db.insert(products).values({ userId, productName, unitPrice });
}

export async function removeProduct(userId: string, productId: number) {
  const db = getDb();
  await db.delete(products).where(and(eq(products.id, productId), eq(products.userId, userId)));
}

export async function addTransaction(userId: string, productId: number | null, manualProductName: string | null, priceCharged: number, extraData: Record<string, string>) {
  const db = getDb();
  await db.insert(transactions).values({
    userId,
    productId,
    manualProductName,
    priceCharged,
    extraData: JSON.stringify(extraData)
  });
}

export async function getTransactionCount(userId: string, options?: { searchQuery?: string, type?: 'income' | 'expense' }) {
  const db = getDb();
  let conditions = [eq(transactions.userId, userId)];

  if (options?.type === 'income') {
    conditions.push(gte(transactions.priceCharged, 0));
  } else if (options?.type === 'expense') {
    conditions.push(lte(transactions.priceCharged, -0.01));
  }
  
  if (options?.searchQuery) {
    const q = `%${options.searchQuery}%`;
    const countQuery = db.select({ value: count() })
      .from(transactions)
      .leftJoin(products, eq(transactions.productId, products.id))
      .where(and(
        ...conditions,
        or(
          like(products.productName, q),
          like(transactions.manualProductName, q),
          like(transactions.extraData, q)
        )
      ));
    const result = await countQuery;
    return result[0]?.value || 0;
  }

  const result = await db.select({ value: count() }).from(transactions).where(and(...conditions));
  return result[0]?.value || 0;
}

export async function getTransactions(userId: string, options?: { limit?: number, offset?: number, startDate?: string, endDate?: string, searchQuery?: string, type?: 'income' | 'expense' }) {
  const db = getDb();
  
  let conditions = [eq(transactions.userId, userId)];

  if (options?.type === 'income') {
    conditions.push(gte(transactions.priceCharged, 0));
  } else if (options?.type === 'expense') {
    conditions.push(lte(transactions.priceCharged, -0.01));
  }
  
  if (options?.startDate) {
    conditions.push(gte(transactions.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(transactions.createdAt, options.endDate));
  }
  
  if (options?.searchQuery) {
    const q = `%${options.searchQuery}%`;
    conditions.push(or(
      like(products.productName, q),
      like(transactions.manualProductName, q),
      like(transactions.extraData, q)
    )!);
  }

  let query = db.select({
    id: transactions.id,
    userId: transactions.userId,
    productId: transactions.productId,
    manualProductName: transactions.manualProductName,
    priceCharged: transactions.priceCharged,
    extraData: transactions.extraData,
    createdAt: transactions.createdAt,
    productName: products.productName
  })
  .from(transactions)
  .leftJoin(products, eq(transactions.productId, products.id))
  .where(and(...conditions))
  .orderBy(desc(transactions.createdAt))
  .$dynamic();

  if (options?.limit !== undefined) {
    query = query.limit(options.limit);
  }
  if (options?.offset !== undefined) {
    query = query.offset(options.offset);
  }

  const results = await query;
  
  return results.map(r => ({
    id: r.id,
    user_id: r.userId,
    product_id: r.productId,
    manual_product_name: r.manualProductName,
    price_charged: r.priceCharged,
    extra_data: r.extraData,
    created_at: r.createdAt,
    product_name: r.productName
  }));
}

export async function removeTransaction(userId: string, transactionId: number) {
  const db = getDb();
  await db.delete(transactions).where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

export async function updateTransaction(userId: string, transactionId: number, productId: number | null, manualProductName: string | null, priceCharged: number, extraData: Record<string, string>) {
  const db = getDb();
  await db.update(transactions).set({
    productId,
    manualProductName,
    priceCharged,
    extraData: JSON.stringify(extraData)
  }).where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}
