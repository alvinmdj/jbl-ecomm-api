import { z } from "zod";

export const createTransactionBodySchema = z.object({
  sku: z.string().min(1, "SKU must not be empty"),
  qty: z.number().positive("Number must not be 0").or(z.number().negative()),
});
