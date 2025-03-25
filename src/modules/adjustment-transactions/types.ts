import { z } from "zod";

import { createTransactionBodySchema } from "@/modules/adjustment-transactions/schema.js";

export type CreateTransactionRequest = z.infer<
  typeof createTransactionBodySchema
>;

export type CreateTransactionResponse = CreateTransactionRequest;

export type TransactionResponse = {
  id: number;
  sku: string;
  qty: number;
  amount: number;
};
