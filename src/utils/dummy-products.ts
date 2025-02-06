import axios from "axios";

export async function getDummyProducts() {
  const response = await axios.get("https://dummyjson.com/products");

  const products: Array<{
    sku: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    images: Array<string>;
  }> = response.data.products;

  return products;
}
