import axios from "axios";

import { db } from "@/db";
import {
  CreateProductRequest,
  ProductDetailResponse,
  ProductResponse,
} from "@/modules/products/types";

export async function getProducts(limit: number, offset: number) {
  return db.any<ProductResponse>(
    "SELECT title, sku, image, price, stock FROM products LIMIT $1 OFFSET $2",
    [limit, offset]
  );
}

export async function getTotalProductCount(): Promise<number> {
  const result = await db.one("SELECT COUNT(*) AS total FROM products");
  return result.total;
}

export async function getProductBySKU(sku: string) {
  return db.oneOrNone<ProductDetailResponse>(
    "SELECT title, sku, image, price, stock, description FROM products WHERE sku = $1",
    [sku]
  );
}

export async function createProduct({
  title,
  sku,
  image,
  price,
  description,
  stock = 0,
}: CreateProductRequest) {
  return db.one<ProductDetailResponse>(
    "INSERT INTO products (title, sku, image, price, description, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [title, sku, image, price, description, stock]
  );
}

export async function updateProduct(
  selectedSKU: string,
  { title, sku, image, price, description }: CreateProductRequest
) {
  return db.one<ProductDetailResponse>(
    "UPDATE products SET sku = $1, title = $2, image = $3, price = $4, description = $5 WHERE sku = $6 RETURNING *",
    [sku, title, image, price, description, selectedSKU]
  );
}

export async function deleteProduct(sku: string) {
  return db.none("DELETE FROM products WHERE sku = $1", [sku]);
}

export async function getDummyProducts() {
  const response = await axios.get("https://dummyjson.com/products");

  const products: Array<{
    sku: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    images: Array<string>;
  }> = response.data.products;

  return products;
}
