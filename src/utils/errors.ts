export const PRODUCT_NOT_FOUND = "product not found";
export const TRANSACTION_NOT_FOUND = "transaction not found";
export const INSUFFICIENT_PRODUCT_STOCK = "insufficient product stock";
export const INVALID_REQUEST_BODY = "invalid request body";
export const SKU_ALREADY_EXISTS = "SKU already exists";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
