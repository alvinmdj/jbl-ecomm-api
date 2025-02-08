import { FastifyReply, FastifyRequest } from "fastify";

import {
  createTransactionUsecase,
  deleteTransactionUsecase,
  getTransactionByIDUsecase,
  getTransactionsUsecase,
  updateTransactionUsecase,
} from "@/modules/adjustment-transactions/usecase";
import { createTransactionBodySchema } from "@/modules/adjustment-transactions/schema";
import { CreateTransactionRequest } from "@/modules/adjustment-transactions/types";

import { createAPIResponse } from "@/utils/response";
import {
  DEFAULT_PAGE,
  calculateTotalPage,
  Pagination,
} from "@/utils/pagination";
import { INVALID_REQUEST_BODY, TRANSACTION_NOT_FOUND } from "@/utils/errors";

export async function getTransactionsHandler(
  request: FastifyRequest<{ Querystring: { limit?: string; page?: string } }>,
  reply: FastifyReply
) {
  const limit = Number(request.query.limit) || 10;
  const page = Number(request.query.page) || DEFAULT_PAGE;

  const { transactions, totalRecords } = await getTransactionsUsecase(
    limit,
    page
  );

  const pagination: Pagination = {
    page,
    limit,
    totalRecords,
    totalPages: calculateTotalPage(totalRecords, limit),
  };

  return reply.send(createAPIResponse({ data: transactions, pagination }));
}

export async function getTransactionByIDHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const transaction = await getTransactionByIDUsecase(+id);
  if (!transaction) {
    return reply.code(404).send({ message: TRANSACTION_NOT_FOUND });
  }

  return reply.send(createAPIResponse({ data: transaction }));
}

export async function createTransactionHandler(
  request: FastifyRequest<{
    Body: CreateTransactionRequest;
  }>,
  reply: FastifyReply
) {
  const validate = createTransactionBodySchema.safeParse(request.body);
  if (!validate.success) {
    return reply.code(400).send({
      message: INVALID_REQUEST_BODY,
      errors: validate.error.format(),
    });
  }

  const transaction = await createTransactionUsecase(request.body);
  return reply.code(201).send(createAPIResponse({ data: transaction }));
}

export async function updateTransactionHandler(
  request: FastifyRequest<{
    Params: { id: number };
    Body: CreateTransactionRequest;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const validate = createTransactionBodySchema.safeParse(request.body);
  if (!validate.success) {
    return reply.code(400).send({
      message: INVALID_REQUEST_BODY,
      errors: validate.error.format(),
    });
  }

  const updatedTransaction = await updateTransactionUsecase(id, request.body);
  return reply.send(createAPIResponse({ data: updatedTransaction }));
}

export async function deleteTransactionHandler(
  request: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  await deleteTransactionUsecase(id);
  return reply.send({ message: "Transaction deleted successfully" });
}
