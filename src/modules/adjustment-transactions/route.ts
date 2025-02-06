import type { FastifyInstance } from "fastify";

import {
  createTransactionHandler,
  deleteTransactionHandler,
  getTransactionByIDHandler,
  getTransactionsHandler,
  updateTransactionHandler,
} from "@/modules/adjustment-transactions/handler";

export async function adjustmentTransactionsRoutes(app: FastifyInstance) {
  app.get("/", getTransactionsHandler);

  app.get("/:id", getTransactionByIDHandler);

  app.post("/", createTransactionHandler);

  app.put("/:id", updateTransactionHandler);

  app.delete("/:id", deleteTransactionHandler);
}
