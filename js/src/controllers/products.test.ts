import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventV2,
  Context,
  Callback,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

import { createHandler, getHandler, listHandler, updateHandler, deleteHandler } from './products';
import * as productService from '../services/products';
import { Product } from '../models/producs';

jest.mock('../services/products');

const mockProduct: Product = {
  id: 'abc123',
  name: 'Latte',
  price: 12,
  stock: 5,
  createdAt: new Date().toISOString(),
};

const createEvent = (
  payload: object,
  pathParameters?: APIGatewayProxyEventPathParameters,
): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  requestContext: {} as APIGatewayEventRequestContextV2,
  isBase64Encoded: false,
  body: JSON.stringify(payload),
  pathParameters: pathParameters,
});

const dummyContext = {} as Context;
const dummyCallback: Callback = () => {};

describe('Product Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createHandler', () => {
    it('should return 200 for valid product', async () => {
      (productService.createProduct as jest.Mock).mockResolvedValue(mockProduct);
      const res = (await createHandler(
        createEvent({ name: 'Latte', price: 12, stock: 5 }),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if body is missing', async () => {
      const res = (await createHandler(
        { body: undefined } as APIGatewayProxyEventV2,
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(400);
    });
  });

  describe('getHandler', () => {
    it('should return 200 if product found', async () => {
      (productService.getProduct as jest.Mock).mockResolvedValue(mockProduct);
      const res = (await getHandler(
        createEvent({}, { id: 'abc123' }),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (productService.getProduct as jest.Mock).mockResolvedValue(null);
      const res = (await getHandler(
        createEvent({}, { id: 'not-found' }),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 if ID missing', async () => {
      const res = (await getHandler(
        createEvent({}, {}),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(400);
    });
  });

  describe('listHandler', () => {
    it('should return 200 with product list', async () => {
      (productService.listProducts as jest.Mock).mockResolvedValue([mockProduct]);
      const res = (await listHandler(
        {} as APIGatewayProxyEventV2,
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(200);
    });
  });

  describe('updateHandler', () => {
    it('should return 200 on success', async () => {
      (productService.updateProduct as jest.Mock).mockResolvedValue(undefined);
      const res = (await updateHandler(
        createEvent({ price: 15 }, { id: 'abc123' }),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if ID or body missing', async () => {
      const res1 = (await updateHandler(
        createEvent({ price: 15 }, {}),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res1).toBeDefined();
      expect(res1.statusCode).toBe(400);

      const res2 = (await updateHandler(
        createEvent({}, {}),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res2).toBeDefined();
      expect(res2.statusCode).toBe(400);
    });
  });

  describe('deleteHandler', () => {
    it('should return 200 on success', async () => {
      (productService.deleteProduct as jest.Mock).mockResolvedValue(undefined);
      const res = (await deleteHandler(
        createEvent({}, { id: 'abc123' }),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if ID missing', async () => {
      const res = (await deleteHandler(
        createEvent({}, {}),
        dummyContext,
        dummyCallback,
      )) as APIGatewayProxyStructuredResultV2;
      expect(res).toBeDefined();
      expect(res.statusCode).toBe(400);
    });
  });
});
