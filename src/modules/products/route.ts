import { FastifyInstance } from "fastify";

import {
  createProductHandler,
  deleteProductHandler,
  fetchAndSaveProductsHandler,
  getProductBySKUHandler,
  getProductsHandler,
  updateProductHandler,
} from "@/modules/products/handler";

export async function productsRoutes(app: FastifyInstance) {
  app.get("/", getProductsHandler);

  app.get("/:sku", getProductBySKUHandler);

  app.post("/", createProductHandler);

  app.put("/:sku", updateProductHandler);

  app.delete("/:sku", deleteProductHandler);

  app.post("/seed", fetchAndSaveProductsHandler);
}
