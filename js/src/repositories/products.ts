import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

import docClient, { getProductsTableName } from '../config/dynamoDBClient';
import { Product } from '../models/producs';

const TableName = getProductsTableName();

export async function createProduct(product: Product): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName,
      Item: product,
    }),
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName,
      Key: { id },
    }),
  );
  return result.Item ? (result.Item as Product) : null;
}

export async function listProducts(): Promise<Product[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName,
    }),
  );
  return result.Items as Product[];
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const updateExpressions = [];
  const expressionAttributeValues: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(updates)) {
    updateExpressions.push(`${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
  }

  if (!updateExpressions.length) return;

  await docClient.send(
    new UpdateCommand({
      TableName,
      Key: { id },
      UpdateExpression: `set ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
    }),
  );
}

export async function deleteProduct(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName,
      Key: { id },
    }),
  );
}
