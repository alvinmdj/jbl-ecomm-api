import * as productsRepository from "@/modules/products/repository.js";
import * as dummyProducts from "@/utils/dummy-products.js";

import { ProductResponse } from "@/modules/products/types.js";
import {
  createProductUsecase,
  deleteProductUsecase,
  fetchAndSaveProductsUsecase,
  getProductBySKUUsecase,
  getProductsUsecase,
  updateProductUsecase,
} from "@/modules/products/usecase.js";
import { PRODUCT_NOT_FOUND, SKU_ALREADY_EXISTS } from "@/utils/errors.js";

describe("getProductsUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return products and total count for first page with default limit", async () => {
    const mockProducts = [
      {
        sku: "SKU1",
        title: "Product 1",
        price: 10,
        stock: 5,
        image: "image1.jpg",
      },
      {
        sku: "SKU2",
        title: "Product 2",
        price: 20,
        stock: 10,
        image: "image2.jpg",
      },
    ];
    const mockTotalCount = 2;

    jest
      .spyOn(productsRepository, "getTotalProductCount")
      .mockResolvedValue(mockTotalCount);
    jest
      .spyOn(productsRepository, "getProducts")
      .mockResolvedValue(mockProducts);

    const result = await getProductsUsecase(8, 1);

    expect(productsRepository.getTotalProductCount).toHaveBeenCalled();
    expect(productsRepository.getProducts).toHaveBeenCalledWith(8, 0);
    expect(result).toEqual({
      totalRecords: mockTotalCount,
      products: mockProducts,
    });
  });

  it("should handle 1000 limit with first page", async () => {
    const mockProducts: ProductResponse[] = [];
    const mockTotalCount = 5;

    jest
      .spyOn(productsRepository, "getTotalProductCount")
      .mockResolvedValue(mockTotalCount);
    jest
      .spyOn(productsRepository, "getProducts")
      .mockResolvedValue(mockProducts);

    const result = await getProductsUsecase(1000, 1);

    expect(productsRepository.getTotalProductCount).toHaveBeenCalled();
    expect(productsRepository.getProducts).toHaveBeenCalledWith(1000, 0);
    expect(result).toEqual({
      totalRecords: mockTotalCount,
      products: mockProducts,
    });
  });
});

describe("getProductBySKUUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return product by SKU", async () => {
    const mockProduct = {
      sku: "SKU1",
      title: "Product 1",
      price: 10,
      stock: 5,
      image: "image1.jpg",
    };

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValue(mockProduct);

    const result = await getProductBySKUUsecase("SKU1");

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith("SKU1");
    expect(result).toEqual(mockProduct);
  });

  it("should return null when product not found", async () => {
    jest.spyOn(productsRepository, "getProductBySKU").mockResolvedValue(null);

    const result = await getProductBySKUUsecase("SKU1");

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith("SKU1");
    expect(result).toBeNull();
  });
});

describe("createProductUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create product", async () => {
    const mockRequest = {
      sku: "SKU1",
      title: "Product 1",
      price: 10,
      image: "image1.jpg",
      description: "Description",
    };

    jest
      .spyOn(productsRepository, "createProduct")
      .mockResolvedValue(mockRequest);

    const result = await createProductUsecase(mockRequest);

    expect(productsRepository.createProduct).toHaveBeenCalledWith(mockRequest);
    expect(result).toEqual(mockRequest);
  });

  it("should create product successfully with only required fields", async () => {
    const mockRequest = {
      sku: "SKU1",
      title: "Product 1",
      price: 10,
      image: "image1.jpg",
    };

    jest
      .spyOn(productsRepository, "createProduct")
      .mockResolvedValue(mockRequest);

    const result = await createProductUsecase(mockRequest);

    expect(productsRepository.createProduct).toHaveBeenCalledWith(mockRequest);
    expect(result).toEqual(mockRequest);
  });
});

describe("updateProductUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update product when SKU exists and new SKU matches old SKU", async () => {
    const existingSKU = "SKU1";

    const mockProduct = {
      sku: existingSKU,
      title: "Product 1",
      price: 10,
      image: "image1.jpg",
      stock: 5,
    };

    const updateRequest = {
      sku: existingSKU,
      title: "Updated Product",
      price: 20,
      image: "new-image.jpg",
      description: "New Description",
    };

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValueOnce(mockProduct);

    jest
      .spyOn(productsRepository, "updateProduct")
      .mockResolvedValue({ ...updateRequest });

    const result = await updateProductUsecase(existingSKU, updateRequest);

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith(
      existingSKU
    );
    expect(productsRepository.updateProduct).toHaveBeenCalledWith(
      existingSKU,
      updateRequest
    );
    expect(result).toEqual(updateRequest);
  });

  it("should throw PRODUCT_NOT_FOUND error when product does not exist", async () => {
    const nonExistentSKU = "INVALID-SKU";
    const updateRequest = {
      sku: "NEW-SKU",
      title: "New Product",
      price: 20,
      image: "image.jpg",
      description: "Description",
    };

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValueOnce(null);

    await expect(
      updateProductUsecase(nonExistentSKU, updateRequest)
    ).rejects.toThrow(PRODUCT_NOT_FOUND);

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith(
      nonExistentSKU
    );
    expect(productsRepository.updateProduct).not.toHaveBeenCalled();
  });

  it("should throw SKU_ALREADY_EXISTS when new SKU is already used by another product", async () => {
    const existingProduct = {
      sku: "EXISTING_SKU",
      title: "Existing Product",
      price: 20,
      image: "existing_image.jpg",
      stock: 5,
    };

    const updateRequest = {
      sku: "EXISTING_SKU",
      title: "Updated Product",
      price: 30,
      image: "updated_image.jpg",
      description: "Updated Description",
    };

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValueOnce(existingProduct) // Mock existing product for the current SKU
      .mockResolvedValueOnce(existingProduct); // Mock existing product for the new SKU

    await expect(
      updateProductUsecase("CURRENT_SKU", updateRequest)
    ).rejects.toThrow(SKU_ALREADY_EXISTS);

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith(
      "CURRENT_SKU"
    );
    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith(
      "EXISTING_SKU"
    );
  });
});

describe("deleteProductUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete product", async () => {
    const existingSKU = "SKU1";

    const mockProduct = {
      sku: existingSKU,
      title: "Product 1",
      price: 10,
      image: "image1.jpg",
      stock: 5,
    };

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValueOnce(mockProduct);

    jest.spyOn(productsRepository, "deleteProduct").mockResolvedValue(null);

    await expect(deleteProductUsecase(existingSKU)).resolves.toBe(null);

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith(
      existingSKU
    );
    expect(productsRepository.deleteProduct).toHaveBeenCalledWith(existingSKU);
  });

  it("should throw PRODUCT_NOT_FOUND error when product does not exist", async () => {
    const nonExistentSKU = "INVALID-SKU";

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValueOnce(null);

    await expect(deleteProductUsecase(nonExistentSKU)).rejects.toThrow(
      PRODUCT_NOT_FOUND
    );

    expect(productsRepository.getProductBySKU).toHaveBeenCalledWith(
      nonExistentSKU
    );
    expect(productsRepository.deleteProduct).not.toHaveBeenCalled();
  });
});

describe("fetchAndSaveProductsUsecase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch products and save only new ones to database", async () => {
    const mockProducts = [
      {
        sku: "SKU1",
        title: "Product 1",
        description: "Description 1",
        price: 10,
        stock: 5,
        images: ["image1.jpg"],
      },
      {
        sku: "SKU2",
        title: "Product 2",
        description: "Description 2",
        price: 20,
        stock: 10,
        images: ["image2.jpg"],
      },
    ];

    jest
      .spyOn(dummyProducts, "getDummyProducts")
      .mockResolvedValue(mockProducts);

    jest
      .spyOn(productsRepository, "getProductBySKU")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        sku: "SKU2",
        title: "Product 2",
        description: "Description 2",
        price: 20,
        stock: 10,
        image: "image2.jpg",
      });

    jest
      .spyOn(productsRepository, "createProductWithTransaction")
      .mockResolvedValue(undefined);

    const result = await fetchAndSaveProductsUsecase();

    expect(dummyProducts.getDummyProducts).toHaveBeenCalled();
    expect(productsRepository.getProductBySKU).toHaveBeenCalledTimes(2);
    expect(
      productsRepository.createProductWithTransaction
    ).toHaveBeenCalledTimes(1);
    expect(
      productsRepository.createProductWithTransaction
    ).toHaveBeenCalledWith({
      sku: "SKU1",
      title: "Product 1",
      description: "Description 1",
      price: 10,
      stock: 5,
      image: "image1.jpg",
    });
    expect(result).toEqual({
      message: "Products fetched and saved successfully.",
    });
  });

  it("should throw error when external API call fails", async () => {
    jest
      .spyOn(dummyProducts, "getDummyProducts")
      .mockRejectedValue(new Error("Network error"));

    await expect(fetchAndSaveProductsUsecase()).rejects.toThrow(
      "Network error"
    );

    expect(dummyProducts.getDummyProducts).toHaveBeenCalled();
    expect(productsRepository.getProductBySKU).not.toHaveBeenCalled();
    expect(
      productsRepository.createProductWithTransaction
    ).not.toHaveBeenCalled();
  });
});
