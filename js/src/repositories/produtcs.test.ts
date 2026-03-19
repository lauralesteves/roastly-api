import { createProduct, getProduct, listProducts, updateProduct, deleteProduct } from './products';
import docClient from '../config/dynamoDBClient';
import { Product } from '../models/producs';

jest.mock('../config/dynamoDBClient', () => ({
  __esModule: true,
  default: { send: jest.fn() },
  getProductsTableName: () => 'test-products',
}));

const mockProduct: Product = {
  id: 'abc123',
  name: 'Espresso',
  price: 10.5,
  stock: 20,
  createdAt: new Date().toISOString(),
};

describe('product.repository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product', async () => {
    await createProduct(mockProduct);
    expect(docClient.send).toHaveBeenCalled();
  });

  it('should get a product by id', async () => {
    (docClient.send as jest.Mock).mockResolvedValue({ Item: mockProduct });
    const result = await getProduct(mockProduct.id);
    expect(docClient.send).toHaveBeenCalled();
    expect(result).toEqual(mockProduct);
  });

  it('should return null if product not found', async () => {
    (docClient.send as jest.Mock).mockResolvedValue({});
    const result = await getProduct('missing-id');
    expect(result).toBeNull();
  });

  it('should list all products', async () => {
    (docClient.send as jest.Mock).mockResolvedValue({ Items: [mockProduct] });
    const result = await listProducts();
    expect(result).toEqual([mockProduct]);
  });

  it('should update a product', async () => {
    await updateProduct(mockProduct.id, { price: 12.0 });
    expect(docClient.send).toHaveBeenCalled();
  });

  it('should delete a product', async () => {
    await deleteProduct(mockProduct.id);
    expect(docClient.send).toHaveBeenCalled();
  });
});
