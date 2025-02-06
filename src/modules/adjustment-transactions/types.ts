import { z } from "zod";

import { createTransactionBodySchema } from "@/modules/adjustment-transactions/schema";

export type CreateTransactionRequest = z.infer<
  typeof createTransactionBodySchema
>;

export type CreateTransactionResponse = CreateTransactionRequest;

export type TransactionResponse = {
  id: number;
  sku: string;
  quantity: number;
  amount: number;
};
