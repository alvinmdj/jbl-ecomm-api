import * as adjustmentTransactionsRepository from "@/modules/adjustment-transactions/repository";
import * as productsUsecase from "@/modules/products/usecase";

import {
  createTransactionUsecase,
  deleteTransactionUsecase,
  getTransactionByIDUsecase,
  getTransactionsUsecase,
  updateTransactionUsecase,
} from "@/modules/adjustment-transactions/usecase";
import {
  PRODUCT_NOT_FOUND,
  INSUFFICIENT_PRODUCT_STOCK,
  TRANSACTION_NOT_FOUND,
} from "@/utils/errors";

describe("getTransactionsUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return total records and transactions", async () => {
    const mockTotalRecords = 10;
    const mockTransactions = [
      {
        id: 1,
        sku: "product-1",
        qty: 10,
        amount: 100,
      },
    ];

    const mockGetTotalTransactionCount = jest
      .spyOn(adjustmentTransactionsRepository, "getTotalTransactionCount")
      .mockResolvedValue(mockTotalRecords);

    const mockGetTransactions = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactions")
      .mockResolvedValue(mockTransactions);

    const result = await getTransactionsUsecase(5, 1);

    expect(mockGetTotalTransactionCount).toHaveBeenCalledWith();
    expect(mockGetTransactions).toHaveBeenCalledWith(5, 0);
    expect(result).toEqual({
      totalRecords: mockTotalRecords,
      transactions: mockTransactions,
    });
  });
});

describe("getTransactionByIDUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return transaction when found", async () => {
    const mockTransaction = {
      id: 1,
      sku: "product-1",
      qty: 10,
      amount: 100,
    };

    const mockGetTransactionById = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactionById")
      .mockResolvedValue(mockTransaction);

    const result = await getTransactionByIDUsecase(1);

    expect(mockGetTransactionById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockTransaction);
  });
});

describe("createTransactionUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create transaction", async () => {
    const mockRequest = {
      sku: "product-1",
      qty: 10,
    };

    const mockProduct = {
      sku: "product-1",
      stock: 15,
      title: "Product 1",
      image: "image.jpg",
      price: 100,
    };

    const mockCreateTransaction = jest
      .spyOn(adjustmentTransactionsRepository, "createTransaction")
      .mockResolvedValue(mockRequest);

    const mockGetProductBySKUUsecase = jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(mockProduct);

    const result = await createTransactionUsecase(mockRequest);

    expect(mockGetProductBySKUUsecase).toHaveBeenCalledWith("product-1");
    expect(mockCreateTransaction).toHaveBeenCalledWith(mockRequest);
    expect(result).toEqual(mockRequest);
  });

  it("should throw error when product not found", async () => {
    const mockRequest = {
      sku: "product-1",
      qty: 10,
    };

    const mockGetProductBySKUUsecase = jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(null);

    await expect(createTransactionUsecase(mockRequest)).rejects.toThrow(
      PRODUCT_NOT_FOUND
    );

    expect(mockGetProductBySKUUsecase).toHaveBeenCalledWith("product-1");
  });

  it("should throw error when insufficient product stock", async () => {
    const mockRequest = {
      sku: "product-1",
      qty: -20,
    };

    const mockProduct = {
      sku: "product-1",
      stock: 10,
      title: "Product 1",
      image: "image.jpg",
      price: 100,
    };

    const mockGetProductBySKUUsecase = jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(mockProduct);

    await expect(createTransactionUsecase(mockRequest)).rejects.toThrowError(
      INSUFFICIENT_PRODUCT_STOCK
    );

    expect(mockGetProductBySKUUsecase).toHaveBeenCalledWith("product-1");
  });
});

describe("updateTransactionUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update transaction", async () => {
    const mockRequest = {
      sku: "product-1",
      qty: 10,
    };

    const mockTransaction = {
      id: 1,
      sku: "product-1",
      qty: 5,
      amount: 50,
    };

    const mockProduct = {
      sku: "product-1",
      stock: 15,
      title: "Product 1",
      image: "image.jpg",
      price: 100,
    };

    const mockGetTransactionById = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactionById")
      .mockResolvedValue(mockTransaction);

    const mockGetProductBySKUUsecase = jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(mockProduct);

    const mockUpdateTransaction = jest
      .spyOn(adjustmentTransactionsRepository, "updateTransaction")
      .mockResolvedValue(mockRequest);

    const result = await updateTransactionUsecase(1, mockRequest);

    expect(mockGetTransactionById).toHaveBeenCalledWith(1);
    expect(mockGetProductBySKUUsecase).toHaveBeenCalledWith("product-1");
    expect(mockUpdateTransaction).toHaveBeenCalledWith(1, mockRequest);
    expect(result).toEqual(mockRequest);
  });

  it("should throw error when transaction not found", async () => {
    const mockRequest = {
      sku: "product-1",
      qty: 10,
    };

    const mockGetTransactionById = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactionById")
      .mockResolvedValue(null);

    await expect(updateTransactionUsecase(1, mockRequest)).rejects.toThrow(
      TRANSACTION_NOT_FOUND
    );

    expect(mockGetTransactionById).toHaveBeenCalledWith(1);
  });

  it("should throw error when product not found", async () => {
    const mockRequest = {
      sku: "product-1",
      qty: 10,
    };

    const mockTransaction = {
      id: 1,
      sku: "product-1",
      qty: 5,
      amount: 50,
    };

    const mockGetTransactionById = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactionById")
      .mockResolvedValue(mockTransaction);

    const mockGetProductBySKUUsecase = jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(null);

    await expect(updateTransactionUsecase(1, mockRequest)).rejects.toThrow(
      PRODUCT_NOT_FOUND
    );

    expect(mockGetTransactionById).toHaveBeenCalledWith(1);
    expect(mockGetProductBySKUUsecase).toHaveBeenCalledWith("product-1");
  });
});

describe("deleteTransactionUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete transaction", async () => {
    const mockTransaction = {
      id: 1,
      sku: "product-1",
      qty: 5,
      amount: 50,
    };

    const mockProduct = {
      sku: "product-1",
      stock: 15,
      title: "Product 1",
      image: "image.jpg",
      price: 100,
    };

    const mockGetTransactionById = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactionById")
      .mockResolvedValue(mockTransaction);

    jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(mockProduct);

    const mockDeleteTransaction = jest
      .spyOn(adjustmentTransactionsRepository, "deleteTransaction")
      .mockResolvedValue(null);

    const result = await deleteTransactionUsecase(1);

    expect(mockGetTransactionById).toHaveBeenCalledWith(1);
    expect(mockDeleteTransaction).toHaveBeenCalledWith(1);
    expect(result).toEqual(null);
  });

  it("should throw error when transaction not found", async () => {
    const mockGetTransactionById = jest
      .spyOn(adjustmentTransactionsRepository, "getTransactionById")
      .mockResolvedValue(null);

    await expect(deleteTransactionUsecase(1)).rejects.toThrow(
      TRANSACTION_NOT_FOUND
    );

    expect(mockGetTransactionById).toHaveBeenCalledWith(1);
  });
});
