import * as productRepo from '../repositories/products';
import { createProduct, getProduct, listProducts, updateProduct, deleteProduct } from './products';
import { Product } from '../models/producs';

jest.mock('../repositories/products');

const mockProduct: Product = {
  id: 'abc123',
  name: 'Cold Brew',
  price: 15,
  stock: 50,
  createdAt: new Date().toISOString(),
};

describe('Product Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product', async () => {
    const spy = jest.spyOn(productRepo, 'createProduct').mockResolvedValueOnce();
    const result = await createProduct(mockProduct);
    expect(spy).toHaveBeenCalledWith(mockProduct);
    expect(result).toEqual(mockProduct);
  });

  it('should get a product by id', async () => {
    const spy = jest.spyOn(productRepo, 'getProduct').mockResolvedValueOnce(mockProduct);
    const result = await getProduct(mockProduct.id);
    expect(spy).toHaveBeenCalledWith(mockProduct.id);
    expect(result).toEqual(mockProduct);
  });

  it('should return null if product not found', async () => {
    const spy = jest.spyOn(productRepo, 'getProduct').mockResolvedValueOnce(null);
    const result = await getProduct('unknown');
    expect(result).toBeNull();
  });

  it('should list all products', async () => {
    const spy = jest.spyOn(productRepo, 'listProducts').mockResolvedValueOnce([mockProduct]);
    const result = await listProducts();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual([mockProduct]);
  });

  it('should update a product', async () => {
    const spy = jest.spyOn(productRepo, 'updateProduct').mockResolvedValueOnce();
    await updateProduct(mockProduct.id, { stock: 25 });
    expect(spy).toHaveBeenCalledWith(mockProduct.id, { stock: 25 });
  });

  it('should delete a product', async () => {
    const spy = jest.spyOn(productRepo, 'deleteProduct').mockResolvedValueOnce();
    await deleteProduct(mockProduct.id);
    expect(spy).toHaveBeenCalledWith(mockProduct.id);
  });
});
