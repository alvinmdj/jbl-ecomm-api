import {
  createProduct,
  createProductWithTransaction,
  deleteProduct,
  getProductBySKU,
  getProducts,
  getTotalProductCount,
  updateProduct,
} from "@/modules/products/repository.js";
import type { CreateProductRequest } from "@/modules/products/types.js";
import { getDummyProducts } from "@/utils/dummy-products.js";
import { PRODUCT_NOT_FOUND, SKU_ALREADY_EXISTS } from "@/utils/errors.js";

export async function getProductsUsecase(limit: number, page: number) {
  const offset = (page - 1) * limit;

  const totalRecords = await getTotalProductCount();

  const products = await getProducts(limit, offset);

  return { totalRecords, products };
}

export async function getProductBySKUUsecase(sku: string) {
  return getProductBySKU(sku);
}

export async function createProductUsecase(request: CreateProductRequest) {
  // const { sku, title, description, image, price } = request;
  return createProduct(request);
}

export async function updateProductUsecase(
  sku: string,
  request: CreateProductRequest
) {
  const product = await getProductBySKU(sku);
  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  const newProduct = await getProductBySKU(request.sku);
  if (newProduct && newProduct.sku !== sku) {
    throw new Error(SKU_ALREADY_EXISTS);
  }

  return updateProduct(sku, request);
}

export async function deleteProductUsecase(sku: string) {
  const existingProduct = await getProductBySKUUsecase(sku);
  if (!existingProduct) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  return deleteProduct(sku);
}

export async function fetchAndSaveProductsUsecase() {
  const products = await getDummyProducts();

  for (const product of products) {
    const existingProduct = await getProductBySKU(product.sku);

    if (!existingProduct) {
      await createProductWithTransaction({
        sku: product.sku,
        title: product.title,
        image: product.images[0],
        price: product.price,
        description: product.description,
        stock: product.stock,
      });
    }
  }

  return { message: "Products fetched and saved successfully." };
}
