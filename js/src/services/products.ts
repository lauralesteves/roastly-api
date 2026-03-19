import { Product } from '../models/producs';
import {
  createProduct as createProductInRepo,
  getProduct as getProductFromRepo,
  listProducts as listProductsFromRepo,
  updateProduct as updateProductInRepo,
  deleteProduct as deleteProductFromRepo,
} from '../repositories/products';

/**
 * Save a new product to the database.
 * @param product - A product object (with id, name, price, stock, createdAt)
 * @returns The same product after saving
 */
export async function createProduct(product: Product): Promise<Product> {
  await createProductInRepo(product);
  return product;
}

/**
 * Retrieve a product from the database by its ID.
 * @param id - The ID of the product to retrieve
 * @returns The product if found, or null
 */
export async function getProduct(id: string): Promise<Product | null> {
  return getProductFromRepo(id);
}

/**
 * Retrieve all products from the database.
 * @returns An array of all product objects
 */
export async function listProducts(): Promise<Product[]> {
  return listProductsFromRepo();
}

/**
 * Update a product in the database by ID.
 * @param id - The ID of the product to update
 * @param updates - An object containing fields to update (name, price, stock, etc.)
 * @returns Nothing
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await updateProductInRepo(id, updates);
}

/**
 * Delete a product from the database by ID.
 * @param id - The ID of the product to delete
 * @returns Nothing
 */
export async function deleteProduct(id: string): Promise<void> {
  await deleteProductFromRepo(id);
}
