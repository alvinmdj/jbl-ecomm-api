import fastify from "fastify";

import { productsRoutes } from "@/modules/products/route";
import { adjustmentTransactionsRoutes } from "@/modules/adjustment-transactions/route";

import {
  getErrorMessage,
  INSUFFICIENT_PRODUCT_STOCK,
  PRODUCT_NOT_FOUND,
  SKU_ALREADY_EXISTS,
  TRANSACTION_NOT_FOUND,
} from "@/utils/errors";

export async function buildServer() {
  const app = fastify();

  // test route
  app.get("/", async () => {
    return { message: "Hello World" };
  });

  app.register(productsRoutes, { prefix: "/api/v1/products" });
  app.register(adjustmentTransactionsRoutes, {
    prefix: "/api/v1/adjustment-transactions",
  });

  app.setErrorHandler((error, _, reply) => {
    const message = getErrorMessage(error);

    if (message === PRODUCT_NOT_FOUND) {
      return reply.code(404).send({ message: PRODUCT_NOT_FOUND });
    }

    if (message === TRANSACTION_NOT_FOUND) {
      return reply.code(404).send({ message: TRANSACTION_NOT_FOUND });
    }

    if (message === INSUFFICIENT_PRODUCT_STOCK) {
      return reply.code(400).send({ message: INSUFFICIENT_PRODUCT_STOCK });
    }

    if (message === SKU_ALREADY_EXISTS) {
      return reply.code(400).send({ message: SKU_ALREADY_EXISTS });
    }

    console.error(error, "Internal server error");
    return reply.code(500).send({ message: "Internal server error" });
  });

  return app;
}
