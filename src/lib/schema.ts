import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  passwordHash: text('password_hash'),
  image: text('image'),
});

export const passwordResets = sqliteTable('password_resets', {
  token: text('token').primaryKey(),
  email: text('email').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

export const userMetadata = sqliteTable('user_metadata', {
  userId: text('user_id').primaryKey(),
  customFields: text('custom_fields'),
  currency: text('currency').default('USD'),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  productName: text('product_name').notNull(),
  unitPrice: real('unit_price').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  productId: integer('product_id'),
  manualProductName: text('manual_product_name'),
  priceCharged: real('price_charged').notNull(),
  extraData: text('extra_data'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
