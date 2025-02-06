CREATE TABLE IF NOT EXISTS products (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "sku" TEXT UNIQUE NOT NULL,
  "image" TEXT NOT NULL,
  "price" DECIMAL NOT NULL,
  "description" TEXT
);
CREATE TABLE IF NOT EXISTS adjustment_transactions (
  "id" SERIAL PRIMARY KEY,
  "sku" TEXT REFERENCES products(sku) ON DELETE CASCADE,
  "qty" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);