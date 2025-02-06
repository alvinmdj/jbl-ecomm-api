import { db } from "@/db";
import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionResponse,
} from "@/modules/adjustment-transactions/types";

export const TRANSACTION_TABLE = "adjustment_transactions";

export async function getTransactions(limit: number, offset: number) {
  return db.any<TransactionResponse>(
    `SELECT * FROM ${TRANSACTION_TABLE} LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
}

export async function getTotalTransactionCount(): Promise<number> {
  const result = await db.one(
    `SELECT COUNT(*) AS total FROM ${TRANSACTION_TABLE}`
  );
  return result.total;
}

export async function getTransactionById(id: number) {
  return db.oneOrNone<TransactionResponse>(
    `SELECT * FROM ${TRANSACTION_TABLE} WHERE id = $1`,
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

export async function deleteTransaction(id: string) {
  return db.none(`DELETE FROM ${TRANSACTION_TABLE} WHERE id = $1`, [id]);
}
