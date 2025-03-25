import type { FastifyInstance } from "fastify";

import * as productsUsecase from "@/modules/products/usecase.js";

import { buildServer } from "@/utils/server.js";
import {
  calculateTotalPage,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/utils/pagination.js";
import {
  INVALID_REQUEST_BODY,
  PRODUCT_NOT_FOUND,
  SKU_ALREADY_EXISTS,
} from "@/utils/errors.js";

const apiPath = "/api/v1/products";

describe("getProductsHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns paginated products with default values when no query parameters provided
  it("should return products with default pagination when no query params provided", async () => {
    const mockProducts = [
      {
        sku: "product-1",
        title: "Product 1",
        image: "image.jpg",
        price: 100,
        stock: 10,
      },
    ];
    const mockTotalRecords = 1;
    const expectedTotalPages = calculateTotalPage(
      mockTotalRecords,
      DEFAULT_PAGE_SIZE
    );

    const mockGetProductsUsecase = jest
      .spyOn(productsUsecase, "getProductsUsecase")
      .mockResolvedValue({
        products: mockProducts,
        totalRecords: mockTotalRecords,
      });

    const response = await app.inject({
      method: "GET",
      url: apiPath,
    });

    const payload = JSON.parse(response.payload);

    expect(response.statusCode).toBe(200);
    expect(mockGetProductsUsecase).toHaveBeenCalledWith(
      DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE
    );
    expect(mockGetProductsUsecase).toHaveBeenCalledTimes(1);

    expect(payload).toEqual({
      data: mockProducts,
      meta: {
        page: DEFAULT_PAGE,
        limit: DEFAULT_PAGE_SIZE,
        totalRecords: mockTotalRecords,
        totalPages: expectedTotalPages,
      },
    });
  });

  // Handles non-numeric limit and page query parameters
  it("should use default values when non-numeric query params provided", async () => {
    const mockProducts = [
      {
        sku: "product-1",
        title: "Product 1",
        image: "image.jpg",
        price: 100,
        stock: 10,
      },
    ];
    const mockTotalRecords = 1;

    const mockGetProductsUsecase = jest.spyOn(
      productsUsecase,
      "getProductsUsecase"
    );
    mockGetProductsUsecase.mockResolvedValue({
      products: mockProducts,
      totalRecords: mockTotalRecords,
    });

    const response = await app.inject({
      method: "GET",
      url: `${apiPath}?limit=abc&page=xyz`,
    });

    expect(response.statusCode).toBe(200);
    expect(mockGetProductsUsecase).toHaveBeenCalledWith(
      DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE
    );

    const payload = JSON.parse(response.payload);
    expect(payload.data).toEqual(mockProducts);
    expect(payload.meta).toEqual({
      page: DEFAULT_PAGE,
      limit: DEFAULT_PAGE_SIZE,
      totalRecords: mockTotalRecords,
      totalPages: 1,
    });
  });
});

describe("getProductBySKUHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns product when found
  it("should return product when found", async () => {
    const mockProduct = {
      sku: "product-1",
      title: "Product 1",
      image: "image.jpg",
      price: 100,
      stock: 10,
      description: "Description",
    };

    jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(mockProduct);

    const response = await app.inject({
      method: "GET",
      url: `${apiPath}/${mockProduct.sku}`,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      data: mockProduct,
    });
  });

  // Returns 404 when product not found
  it("should return 404 when product not found", async () => {
    jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `${apiPath}/product-1`,
    });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload)).toEqual({
      message: PRODUCT_NOT_FOUND,
    });
  });
});

describe("createProductHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns 201 when product created
  it("should return 201 when product created", async () => {
    const mockProduct = {
      sku: "product-1",
      title: "Product 1",
      image: "http://localhost:4000/image.jpg",
      price: 100,
      stock: 0,
      description: "Description",
    };

    jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(null);
    jest
      .spyOn(productsUsecase, "createProductUsecase")
      .mockResolvedValue(mockProduct);

    const response = await app.inject({
      method: "POST",
      url: apiPath,
      payload: mockProduct,
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.payload)).toEqual({
      data: mockProduct,
    });
  });

  // Returns 400 when product already exists
  it("should return 400 when product already exists", async () => {
    const mockProduct = {
      sku: "product-1",
      title: "Product 1",
      image: "http://localhost:4000/image.jpg",
      price: 100,
      stock: 10,
      description: "Description",
    };

    jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(mockProduct);

    const response = await app.inject({
      method: "POST",
      url: apiPath,
      payload: mockProduct,
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      message: SKU_ALREADY_EXISTS,
    });
  });

  // Returns 400 when invalid request body
  it("should return 400 when invalid request body", async () => {
    const mockProduct = {
      sku: "product-1",
      title: "Product 1",
      image: "invalid image url",
      price: 100,
      stock: 10,
    };

    jest
      .spyOn(productsUsecase, "getProductBySKUUsecase")
      .mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: apiPath,
      payload: mockProduct,
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      message: INVALID_REQUEST_BODY,
      errors: {
        _errors: [],
        image: {
          _errors: ["Image must be a valid URL"],
        },
      },
    });
  });
});

describe("updateProductHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns updated product
  it("should return updated product", async () => {
    const mockProduct = {
      sku: "product-1",
      title: "Product 1",
      image: "http://localhost:4000/image.jpg",
      price: 100,
      stock: 10,
      description: "Description",
    };

    jest
      .spyOn(productsUsecase, "updateProductUsecase")
      .mockResolvedValue(mockProduct);

    const response = await app.inject({
      method: "PUT",
      url: `${apiPath}/${mockProduct.sku}`,
      payload: mockProduct,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      data: mockProduct,
    });
  });

  // Returns 400 when invalid request body
  it("should return 400 when invalid request body", async () => {
    const mockProduct = {
      sku: "product-1",
      title: "",
      image: "http://localhost:4000/image.jpg",
      price: 100,
      stock: 10,
    };

    const response = await app.inject({
      method: "PUT",
      url: `${apiPath}/${mockProduct.sku}`,
      payload: mockProduct,
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      message: INVALID_REQUEST_BODY,
      errors: {
        _errors: [],
        title: {
          _errors: ["Title must not be empty"],
        },
      },
    });
  });
});

describe("deleteProductHandler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildServer();
  });

  afterEach(async () => {
    await app.close();
  });

  // Returns 200 when product deleted
  it("should return 200 when product deleted", async () => {
    jest.spyOn(productsUsecase, "deleteProductUsecase").mockResolvedValue(null);

    const response = await app.inject({
      method: "DELETE",
      url: `${apiPath}/product-1`,
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      message: "product deleted successfully",
    });
  });

  // Returns 404 when product not found
  it("should return 404 when product not found", async () => {
    jest
      .spyOn(productsUsecase, "deleteProductUsecase")
      .mockRejectedValue(new Error(PRODUCT_NOT_FOUND));

    const response = await app.inject({
      method: "DELETE",
      url: `${apiPath}/product-1`,
    });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload)).toEqual({
      message: PRODUCT_NOT_FOUND,
    });
  });
});
