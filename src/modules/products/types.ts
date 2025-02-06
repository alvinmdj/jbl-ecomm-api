import { z } from "zod";

import { createProductBodySchema } from "@/modules/products/schema";

export type CreateProductRequest = z.infer<typeof createProductBodySchema>;

export type CreateProductWithStockRequest = CreateProductRequest & {
  stock: number;
};

export type ProductResponse = {
  title: string;
  sku: string;
  image: string;
  price: number;
  stock: number;
};

export type ProductDetailResponse = ProductResponse & {
  description?: string;
};
