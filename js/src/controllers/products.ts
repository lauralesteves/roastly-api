import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

import { ProductInput, validateProductInput } from '../models/producs';
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} from '../services/products';
import { badRequest, notFound, ok, created, serverError } from './helper';

/**
 * Create a new product
 */
export const createHandler: APIGatewayProxyHandlerV2 = async (
  event,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return badRequest({ payload: 'Missing request body' });
    }

    const input: ProductInput = JSON.parse(event.body);
    const { error } = validateProductInput(input);

    if (error) {
      return badRequest({ payload: error });
    }

    const product = {
      id: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
    };

    await createProduct(product);

    return ok({ payload: product });
  } catch (err) {
    console.error('CreateProduct error:', err);
    return serverError();
  }
};

/**
 * Retrieve a product by ID
 */
export const getHandler: APIGatewayProxyHandlerV2 = async (
  event,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest({ payload: 'Missing product ID' });

    const product = await getProduct(id);
    if (!product) return notFound({});

    return ok({ payload: product });
  } catch (err) {
    console.error('GetProduct error:', err);
    return serverError();
  }
};

/**
 * List all products
 */
export const listHandler: APIGatewayProxyHandlerV2 = async (): Promise<APIGatewayProxyResultV2> => {
  try {
    const products = await listProducts();
    return ok({ payload: products });
  } catch (err) {
    console.error('ListProducts error:', err);
    return serverError();
  }
};

/**
 * Update a product by ID
 */
export const updateHandler: APIGatewayProxyHandlerV2 = async (
  event,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest({ payload: 'Missing product ID' });

    if (!event.body) return badRequest({ payload: 'Missing request body' });

    const updates = JSON.parse(event.body);
    await updateProduct(id, updates);

    return ok({ payload: { id, ...updates } });
  } catch (err) {
    console.error('UpdateProduct error:', err);
    return serverError();
  }
};

/**
 * Delete a product by ID
 */
export const deleteHandler: APIGatewayProxyHandlerV2 = async (
  event,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest({ payload: 'Missing product ID' });

    await deleteProduct(id);

    return ok({ payload: { id } });
  } catch (err) {
    console.error('DeleteProduct error:', err);
    return serverError();
  }
};
