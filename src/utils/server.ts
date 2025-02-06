import fastify from "fastify";

import { productsRoutes } from "@/modules/products/route";

export async function buildServer() {
  const app = fastify();

  // test route
  app.get("/", async () => {
    return { message: "Hello World" };
  });

  app.register(productsRoutes, { prefix: "/api/v1/products" });
  // app.register(adjustmentTransactionRoutes, { prefix: "/api/adjustment-transactions" });

  return app;
}
