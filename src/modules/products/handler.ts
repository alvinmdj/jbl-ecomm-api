import { FastifyReply, FastifyRequest } from "fastify";

import { CreateProductRequest } from "@/modules/products/types";
import {
  createProductUsecase,
  deleteProductUsecase,
  fetchAndSaveProductsUsecase,
  getProductBySKUUsecase,
  getProductsUsecase,
  updateProductUsecase,
} from "@/modules/products/usecase";
import { createProductBodySchema } from "@/modules/products/schema";

import { createAPIResponse } from "@/utils/response";
import {
  calculateTotalPage,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  Pagination,
} from "@/utils/pagination";
import { SKU_ALREADY_EXISTS } from "@/utils/errors";

export async function getProductsHandler(
  request: FastifyRequest<{ Querystring: { limit?: string; page?: string } }>,
  reply: FastifyReply
) {
  const limit = Number(request.query.limit) || DEFAULT_PAGE_SIZE;
  const page = Number(request.query.page) || DEFAULT_PAGE;

  const { products, totalRecords } = await getProductsUsecase(limit, page);

  const pagination: Pagination = {
    page,
    limit,
    totalRecords,
    totalPages: calculateTotalPage(totalRecords, limit),
  };

  return reply.send(createAPIResponse({ data: products, pagination }));
}

export async function getProductBySKUHandler(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
) {
  const { sku } = request.params;

  const product = await getProductBySKUUsecase(sku);
  if (!product) {
    return reply.code(404).send({ message: "product not found" });
  }

  return reply.send(createAPIResponse({ data: product }));
}

export async function createProductHandler(
  request: FastifyRequest<{
    Body: CreateProductRequest;
  }>,
  reply: FastifyReply
) {
  const { sku } = request.body;

  const existingProduct = await getProductBySKUUsecase(sku);
  if (existingProduct) {
    return reply.code(400).send({ message: SKU_ALREADY_EXISTS });
  }

  const validate = createProductBodySchema.safeParse(request.body);
  if (!validate.success) {
    return reply.code(400).send({
      message: "invalid request body",
      errors: validate.error.format(),
    });
  }

  const product = await createProductUsecase(request.body);
  return reply.code(201).send(createAPIResponse({ data: product }));
}

export async function updateProductHandler(
  request: FastifyRequest<{
    Params: { sku: string };
    Body: CreateProductRequest;
  }>,
  reply: FastifyReply
) {
  const validate = createProductBodySchema.safeParse(request.body);
  if (!validate.success) {
    return reply.code(400).send({
      message: "invalid request body",
      errors: validate.error.format(),
    });
  }

  const updatedProduct = await updateProductUsecase(
    request.params.sku,
    request.body
  );
  return reply.send(createAPIResponse({ data: updatedProduct }));
}

export async function deleteProductHandler(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
) {
  const { sku } = request.params;
  await deleteProductUsecase(sku);
  return reply.send({ message: "product deleted successfully" });
}

export async function fetchAndSaveProductsHandler(
  _: FastifyRequest,
  reply: FastifyReply
) {
  const result = await fetchAndSaveProductsUsecase();
  return reply.send(result);
}
