import { FastifyInstance } from "fastify";

import * as adjustmentTransactionsUsecase from "@/modules/adjustment-transactions/usecase";

import { buildServer } from "@/utils/server";
import { calculateTotalPage, DEFAULT_PAGE } from "@/utils/pagination";
import { TRANSACTION_NOT_FOUND } from "@/utils/errors";

const apiPath = "/api/v1/adjustment-transactions";

describe("getTransactionsHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns paginated transactions with default values when no query parameters provided
  it("should return transactions with default pagination when no query params provided", async () => {
    const mockTransactions = [
      {
        id: 1,
        sku: "product-1",
        qty: 100,
        amount: 100,
      },
    ];
    const mockTotalRecords = 1;
    const expectedTotalPages = calculateTotalPage(mockTotalRecords, 10);

    const mockGetTransactionsUsecase = jest
      .spyOn(adjustmentTransactionsUsecase, "getTransactionsUsecase")
      .mockResolvedValue({
        transactions: mockTransactions,
        totalRecords: mockTotalRecords,
      });

    const response = await app.inject({
      method: "GET",
      url: apiPath,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(200);
    expect(mockGetTransactionsUsecase).toHaveBeenCalledWith(10, DEFAULT_PAGE);
    expect(mockGetTransactionsUsecase).toHaveBeenCalledTimes(1);

    expect(payload.data).toEqual(mockTransactions);
    expect(payload.meta.totalRecords).toEqual(mockTotalRecords);
    expect(payload.meta.totalPages).toEqual(expectedTotalPages);
  });

  // Returns paginated transactions with custom values when query parameters provided
  it("should return transactions with custom pagination when query params provided", async () => {
    const mockTransactions = [
      {
        id: 1,
        sku: "product-1",
        qty: 100,
        amount: 100,
      },
    ];
    const mockTotalRecords = 1;
    const customPage = 2;
    const customLimit = 5;
    const expectedTotalPages = calculateTotalPage(
      mockTotalRecords,
      customLimit
    );

    const mockGetTransactionsUsecase = jest
      .spyOn(adjustmentTransactionsUsecase, "getTransactionsUsecase")
      .mockResolvedValue({
        transactions: mockTransactions,
        totalRecords: mockTotalRecords,
      });

    const response = await app.inject({
      method: "GET",
      url: `${apiPath}?page=${customPage}&limit=${customLimit}`,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(200);
    expect(mockGetTransactionsUsecase).toHaveBeenCalledWith(
      customLimit,
      customPage
    );
    expect(payload.data).toEqual(mockTransactions);
    expect(payload.meta.totalRecords).toEqual(mockTotalRecords);
    expect(payload.meta.totalPages).toEqual(expectedTotalPages);
  });
});

describe("getTransactionByIDHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns 404 when transaction not found
  it("should return 404 when transaction not found", async () => {
    const mockGetTransactionByIDUsecase = jest
      .spyOn(adjustmentTransactionsUsecase, "getTransactionByIDUsecase")
      .mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `${apiPath}/1`,
    });

    expect(response.statusCode).toBe(404);
    expect(mockGetTransactionByIDUsecase).toHaveBeenCalledWith(1);
    expect(response.payload).toEqual(
      JSON.stringify({ message: TRANSACTION_NOT_FOUND })
    );
  });

  // Returns transaction when found
  it("should return transaction when found", async () => {
    const mockTransaction = {
      id: 1,
      sku: "product-1",
      qty: 100,
      amount: 100,
    };

    const mockGetTransactionByIDUsecase = jest
      .spyOn(adjustmentTransactionsUsecase, "getTransactionByIDUsecase")
      .mockResolvedValue(mockTransaction);

    const response = await app.inject({
      method: "GET",
      url: `${apiPath}/1`,
    });

    expect(response.statusCode).toBe(200);
    expect(mockGetTransactionByIDUsecase).toHaveBeenCalledWith(1);
    expect(response.payload).toEqual(JSON.stringify({ data: mockTransaction }));
  });
});

describe("createTransactionHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns 201 when transaction created successfully
  it("should return 201 when transaction created successfully", async () => {
    const mockTransaction = {
      sku: "product-1",
      qty: 100,
    };

    jest
      .spyOn(adjustmentTransactionsUsecase, "createTransactionUsecase")
      .mockResolvedValue(mockTransaction);

    const response = await app.inject({
      method: "POST",
      url: apiPath,
      payload: {
        sku: "product-1",
        qty: 100,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.payload).data).toEqual(mockTransaction);
  });

  // Returns 400 when request body is invalid
  it("should return 400 when request body is invalid", async () => {
    const mockTransaction = {
      sku: "product-1",
      qty: 0,
    };

    const response = await app.inject({
      method: "POST",
      url: apiPath,
      payload: mockTransaction,
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      message: "invalid request body",
      errors: {
        _errors: [],
        qty: {
          _errors: ["Number must not be 0"],
        },
      },
    });
  });
});

describe("updateTransactionHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns 200 when transaction updated successfully
  it("should return 200 when transaction updated successfully", async () => {
    const mockTransaction = {
      sku: "product-1",
      qty: 100,
    };

    jest
      .spyOn(adjustmentTransactionsUsecase, "updateTransactionUsecase")
      .mockResolvedValue(mockTransaction);

    const response = await app.inject({
      method: "PUT",
      url: `${apiPath}/1`,
      payload: mockTransaction,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).data).toEqual(mockTransaction);
  });

  // Returns 400 when request body is invalid
  it("should return 400 when request body is invalid", async () => {
    const mockTransaction = {
      sku: "product-1",
      qty: 0,
    };

    const response = await app.inject({
      method: "PUT",
      url: `${apiPath}/1`,
      payload: mockTransaction,
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      message: "invalid request body",
      errors: {
        _errors: [],
        qty: {
          _errors: ["Number must not be 0"],
        },
      },
    });
  });
});

describe("deleteTransactionHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns 200 when transaction deleted successfully
  it("should return 200 when transaction deleted successfully", async () => {
    jest
      .spyOn(adjustmentTransactionsUsecase, "deleteTransactionUsecase")
      .mockResolvedValue(null);

    const response = await app.inject({
      method: "DELETE",
      url: `${apiPath}/1`,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      message: "Transaction deleted successfully",
    });
  });

  // Returns 404 when transaction not found
  it("should return 404 when transaction not found", async () => {
    jest
      .spyOn(adjustmentTransactionsUsecase, "deleteTransactionUsecase")
      .mockRejectedValue(new Error(TRANSACTION_NOT_FOUND));

    const response = await app.inject({
      method: "DELETE",
      url: `${apiPath}/1`,
    });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload)).toEqual({
      message: TRANSACTION_NOT_FOUND,
    });
  });
});
