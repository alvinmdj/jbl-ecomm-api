import { FastifyInstance } from "fastify";

import { buildServer } from "@/utils/server";

describe("GET / endpoint", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET / returns status 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.payload).message).toEqual("Hello World");
  });
});
