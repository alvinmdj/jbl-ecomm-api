import { db } from "@/db/index.js";
import { TRANSACTION_TABLE } from "@/modules/adjustment-transactions/repository.js";
import type {
  CreateProductRequest,
  CreateProductWithStockRequest,
  ProductDetailResponse,
  ProductResponse,
} from "@/modules/products/types.js";

export const PRODUCT_TABLE = "products";

export async function getProducts(limit: number, offset: number) {
  return db.any<ProductResponse>(
    ` SELECT p.title, p.sku, p.image, p.price, COALESCE(SUM(t.qty), 0) AS stock
      FROM ${PRODUCT_TABLE} p
      LEFT JOIN ${TRANSACTION_TABLE} t ON p.sku = t.sku
      GROUP BY p.id
      ORDER BY p.id DESC
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );
}

export async function getTotalProductCount(): Promise<number> {
  const result = await db.one(`SELECT COUNT(*) AS total FROM ${PRODUCT_TABLE}`);
  return +result.total;
}

export async function getProductBySKU(sku: string) {
  return db.oneOrNone<ProductDetailResponse>(
    `
      SELECT p.title, p.sku, p.image, p.price, p.description, COALESCE(SUM(t.qty), 0) AS stock
      FROM ${PRODUCT_TABLE} p
      LEFT JOIN ${TRANSACTION_TABLE} t ON p.sku = t.sku
      WHERE p.sku = $1
      GROUP BY p.id
    `,
    [sku]
  );
}

export async function createProduct({
  title,
  sku,
  image,
  price,
  description,
}: CreateProductRequest) {
  return db.one<Omit<ProductResponse, "stock">>(
    `INSERT INTO ${PRODUCT_TABLE} (title, sku, image, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, sku, image, price, description]
  );
}

export async function updateProduct(
  selectedSKU: string,
  { title, sku, image, price, description }: CreateProductRequest
) {
  return db.one<Omit<ProductResponse, "stock">>(
    `UPDATE ${PRODUCT_TABLE} SET sku = $1, title = $2, image = $3, price = $4, description = $5 WHERE sku = $6 RETURNING *`,
    [sku, title, image, price, description, selectedSKU]
  );
}

export async function deleteProduct(sku: string) {
  return db.none(`DELETE FROM ${PRODUCT_TABLE} WHERE sku = $1`, [sku]);
}

export async function createProductWithTransaction({
  title,
  sku,
  image,
  price,
  description,
  stock,
}: CreateProductWithStockRequest) {
  return db.tx(async (t) => {
    await t.none(
      `INSERT INTO ${PRODUCT_TABLE} (title, sku, image, price, description) VALUES ($1, $2, $3, $4, $5)`,
      [title, sku, image, price, description]
    );

    await t.none(
      `INSERT INTO ${TRANSACTION_TABLE} (sku, qty) VALUES ($1, $2)`,
      [sku, stock]
    );
  });
}
