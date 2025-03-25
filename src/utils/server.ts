import fastify from "fastify";
import cors from "@fastify/cors";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

import { productsRoutes } from "@/modules/products/route";
import { adjustmentTransactionsRoutes } from "@/modules/adjustment-transactions/route";

import {
  getErrorMessage,
  INSUFFICIENT_PRODUCT_STOCK,
  PRODUCT_NOT_FOUND,
  SKU_ALREADY_EXISTS,
  TRANSACTION_NOT_FOUND,
} from "@/utils/errors";
import {
  response200Schema,
  response400Schema,
  responseDefaultSchema,
  testBodySchema,
  testParamsSchema,
  testQsSchema,
} from "@/utils/experimental/json-schemas";

export async function buildServer() {
  const app = fastify().withTypeProvider<JsonSchemaToTsProvider>();

  // cors
  await app.register(cors, {
    // allow localhost port 3000 (web) to access this server
    origin: ["http://localhost:3000"],
  });

  // test route
  app.post(
    "/test/:parStr/:parNum",
    {
      schema: {
        body: testBodySchema,
        // headers: {},
        params: testParamsSchema,
        querystring: testQsSchema,
        response: {
          default: responseDefaultSchema,
          200: response200Schema,
          400: response400Schema,
        },
      },
    },
    async (request, reply) => {
      const { name, age } = request.query;
      const { parStr, parNum } = request.params;
      const { str, num, bool } = request.body;

      console.log(
        "Request =>\n" +
          JSON.stringify(
            { params: request.params, query: request.query },
            null,
            2
          )
      );

      return reply.status(200).send({
        // value won't be sent if not defined in response 200 schema
        data: {
          qs: { name, age },
          params: { parStr, parNum },
          body: { str, num, bool },
        },
      });
    }
  );

  // routes
  app.register(productsRoutes, { prefix: "/api/v1/products" });
  app.register(adjustmentTransactionsRoutes, {
    prefix: "/api/v1/adjustment-transactions",
  });

  // error handler
  app.setErrorHandler((error, _, reply) => {
    if (error.validation) {
      return reply.code(400).send({
        message: error.message,
      });
    }

    const message = getErrorMessage(error);

    if (message === PRODUCT_NOT_FOUND) {
      return reply.code(404).send({ message: PRODUCT_NOT_FOUND });
    }

    if (message === TRANSACTION_NOT_FOUND) {
      return reply.code(404).send({ message: TRANSACTION_NOT_FOUND });
    }

    if (message === INSUFFICIENT_PRODUCT_STOCK) {
      return reply.code(400).send({ message: INSUFFICIENT_PRODUCT_STOCK });
    }

    if (message === SKU_ALREADY_EXISTS) {
      return reply.code(400).send({ message: SKU_ALREADY_EXISTS });
    }

    console.error(error, "Internal server error");
    return reply.code(500).send({ message: "Internal server error" });
  });

  return app;
}
