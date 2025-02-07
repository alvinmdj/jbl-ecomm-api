import { db } from "@/db";
import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionResponse,
} from "@/modules/adjustment-transactions/types";
import { PRODUCT_TABLE } from "@/modules/products/repository";

export const TRANSACTION_TABLE = "adjustment_transactions";

export async function getTransactions(limit: number, offset: number) {
  return db.any<TransactionResponse>(
    `
      SELECT t.id, t.sku, t.qty, p.price * t.qty AS amount
      FROM ${TRANSACTION_TABLE} t
      LEFT JOIN ${PRODUCT_TABLE} p ON p.sku = t.sku
      ORDER BY t.id DESC
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );
}

export async function getTotalTransactionCount(): Promise<number> {
  const result = await db.one(
    `SELECT COUNT(*) AS total FROM ${TRANSACTION_TABLE}`
  );
  return +result.total;
}

export async function getTransactionById(id: number) {
  return db.oneOrNone<TransactionResponse>(
    `
      SELECT t.*, p.price * t.qty AS amount
      FROM ${TRANSACTION_TABLE} t
      LEFT JOIN ${PRODUCT_TABLE} p ON p.sku = t.sku
      WHERE t.id = $1
    `,
    [id]
  );
}

export async function createTransaction({
  sku,
  qty,
}: CreateTransactionRequest) {
  return db.one<CreateTransactionResponse>(
    `INSERT INTO ${TRANSACTION_TABLE} (sku, qty) VALUES ($1, $2) RETURNING *`,
    [sku, qty]
  );
}

export async function updateTransaction(
  id: number,
  { sku, qty }: CreateTransactionRequest
) {
  return db.one<CreateTransactionResponse>(
    `UPDATE ${TRANSACTION_TABLE} SET sku = $1, qty = $2 WHERE id = $3 RETURNING *`,
    [sku, qty, id]
  );
}

export async function deleteTransaction(id: number) {
  return db.none(`DELETE FROM ${TRANSACTION_TABLE} WHERE id = $1`, [id]);
}
