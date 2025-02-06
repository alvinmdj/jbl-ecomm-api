import {
  createTransaction,
  deleteTransaction,
  getTotalTransactionCount,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "@/modules/adjustment-transactions/repository";
import { CreateTransactionRequest } from "@/modules/adjustment-transactions/types";
import { getProductBySKUUsecase } from "@/modules/products/usecase";
import {
  INSUFFICIENT_PRODUCT_STOCK,
  PRODUCT_NOT_FOUND,
  TRANSACTION_NOT_FOUND,
} from "@/utils/errors";

export async function getTransactionsUsecase(limit: number, page: number) {
  const offset = (page - 1) * limit;

  const totalRecords = await getTotalTransactionCount();

  const transactions = await getTransactions(limit, offset);

  return { totalRecords, transactions };
}

export async function getTransactionByIDUsecase(id: number) {
  return getTransactionById(id);
}

export async function createTransactionUsecase(
  request: CreateTransactionRequest
) {
  const product = await getProductBySKUUsecase(request.sku);

  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  if (+product.stock + +request.qty < 0) {
    throw new Error(INSUFFICIENT_PRODUCT_STOCK);
  }

  return createTransaction(request);
}

export async function updateTransactionUsecase(
  id: number,
  request: CreateTransactionRequest
) {
  const transaction = await getTransactionById(id);
  if (!transaction) {
    throw new Error(TRANSACTION_NOT_FOUND);
  }

  const isDifferentSKU = transaction.sku !== request.sku;

  const product = await getProductBySKUUsecase(request.sku);
  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  if (isDifferentSKU) {
    // check new SKU product stock
    if (+product.stock + +request.qty < 0) {
      throw new Error(INSUFFICIENT_PRODUCT_STOCK);
    }

    // check old SKU product stock to make sure it's still sufficient after removing old qty
    const oldProduct = await getProductBySKUUsecase(transaction.sku);
    if (!oldProduct) {
      throw new Error(PRODUCT_NOT_FOUND);
    }
    if (+oldProduct.stock - +transaction.qty < 0) {
      throw new Error(INSUFFICIENT_PRODUCT_STOCK);
    }
  } else {
    // calculate the difference in qty
    const deltaQty = request.qty - transaction.qty;

    // make sure the stock remains sufficient after qty adjustment
    if (+product.stock + +deltaQty < 0) {
      throw new Error(INSUFFICIENT_PRODUCT_STOCK);
    }
  }

  return updateTransaction(id, request);
}

export async function deleteTransactionUsecase(id: number) {
  const existingTransaction = await getTransactionByIDUsecase(id);
  if (!existingTransaction) {
    throw new Error(TRANSACTION_NOT_FOUND);
  }

  const product = await getProductBySKUUsecase(existingTransaction.sku);
  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  if (+product.stock - +existingTransaction.qty < 0) {
    throw new Error(INSUFFICIENT_PRODUCT_STOCK);
  }

  return deleteTransaction(id);
}
