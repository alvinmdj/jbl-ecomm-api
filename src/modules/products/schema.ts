import { z } from "zod";

export const createProductBodySchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  sku: z.string().min(1, "SKU must not be empty"),
  image: z
    .string()
    .min(1, "Image must not be empty")
    .url("Image must be a valid URL"),
  price: z.number().positive("Price must be greater than 0"),
  description: z.string().optional(),
});
