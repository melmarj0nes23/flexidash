-- migrations/0001_initial_schema.sql

-- Drop tables if they exist (useful for reset)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS user_metadata;

-- Create products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit_price REAL NOT NULL
);
CREATE INDEX idx_products_user_id ON products(user_id);

-- Create user_metadata table
CREATE TABLE user_metadata (
  user_id TEXT PRIMARY KEY,
  custom_fields TEXT -- JSON serialized array of strings
);

-- Create transactions table
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  price_charged REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  extra_data TEXT, -- JSON serialized key-value pairs
  FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
