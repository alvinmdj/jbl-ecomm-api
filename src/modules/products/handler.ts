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

export async function getProductsHandler(
  request: FastifyRequest<{ Querystring: { limit?: number; page?: number } }>,
  reply: FastifyReply
) {
  const limit = request.query.limit || DEFAULT_PAGE_SIZE;
  const page = request.query.page || DEFAULT_PAGE;

  try {
    const { products, totalRecords } = await getProductsUsecase(limit, page);

    const pagination: Pagination = {
      page,
      limit,
      totalRecords,
      totalPages: calculateTotalPage(totalRecords, limit),
    };

    return reply.send(createAPIResponse({ data: products, pagination }));
  } catch (error) {
    console.error(error, "failed to get list of products");
    return reply.code(500).send({ message: "failed to get list of products" });
  }
}

export async function getProductBySKUHandler(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
) {
  const { sku } = request.params;

  try {
    const product = await getProductBySKUUsecase(sku);
    if (!product) {
      return reply.code(404).send({ message: "product not found" });
    }

    return reply.send(createAPIResponse({ data: product }));
  } catch (error) {
    console.error(error, "failed to get product by SKU");
    return reply.code(500).send({ message: "failed to get product by SKU" });
  }
}

export async function createProductHandler(
  request: FastifyRequest<{
    Body: CreateProductRequest;
  }>,
  reply: FastifyReply
) {
  const { sku } = request.body;

  try {
    const existingProduct = await getProductBySKUUsecase(sku);
    if (existingProduct) {
      return reply.code(400).send({ message: "SKU already exists" });
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
  } catch (error) {
    console.error(error, "failed to create product");
    return reply.code(500).send({ message: "failed to create product" });
  }
}

export async function updateProductHandler(
  request: FastifyRequest<{
    Params: { sku: string };
    Body: CreateProductRequest;
  }>,
  reply: FastifyReply
) {
  const { sku } = request.params;

  try {
    const existingProduct = await getProductBySKUUsecase(sku);
    if (!existingProduct) {
      return reply.code(404).send({ message: "product not found" });
    }

    const validate = createProductBodySchema.safeParse(request.body);
    if (!validate.success) {
      return reply.code(400).send({
        message: "invalid request body",
        errors: validate.error.format(),
      });
    }

    const updatedProduct = await updateProductUsecase(sku, request.body);
    return reply.send(createAPIResponse({ data: updatedProduct }));
  } catch (error) {
    console.error(error, "failed to update product");
    return reply.code(500).send({ message: "failed to update product" });
  }
}

export async function deleteProductHandler(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
) {
  const { sku } = request.params;

  try {
    const existingProduct = await getProductBySKUUsecase(sku);
    if (!existingProduct) {
      return reply.code(404).send({ message: "product not found" });
    }

    await deleteProductUsecase(sku);
    return reply.send({ message: "product deleted successfully" });
  } catch (error) {
    console.error(error, "failed to delete product");
    return reply.code(500).send({ message: "failed to delete product" });
  }
}

export async function fetchAndSaveProductsHandler(
  _: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await fetchAndSaveProductsUsecase();
    return reply.send(result);
  } catch (error) {
    console.error(error, "failed to fetch and save products");
    return reply
      .code(500)
      .send({ message: "failed to fetch and save products" });
  }
}
