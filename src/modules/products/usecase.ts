import {
  createProduct,
  deleteProduct,
  getDummyProducts,
  getProductBySKU,
  getProducts,
  getTotalProductCount,
  updateProduct,
} from "@/modules/products/repository";
import { CreateProductRequest } from "@/modules/products/types";

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
  const { sku, title, description, image, price } = request;
  return createProduct({ sku, title, description, image, price });
}

export async function updateProductUsecase(
  sku: string,
  request: CreateProductRequest
) {
  return updateProduct(sku, request);
}

export async function deleteProductUsecase(sku: string) {
  return deleteProduct(sku);
}

export async function fetchAndSaveProductsUsecase() {
  const products = await getDummyProducts();

  for (const product of products) {
    const existingProduct = await getProductBySKU(product.sku);

    if (!existingProduct) {
      await createProduct({
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
