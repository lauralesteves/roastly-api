import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import localClient from './dynamoDBClient.local';

const isOffline = process.env.IS_OFFLINE;

const client = isOffline ? localClient : DynamoDBDocumentClient.from(new DynamoDBClient({}));

const docClient = DynamoDBDocumentClient.from(client);

export default docClient;

export function getProductsTableName(): string {
  return process.env.PRODUCTS_TABLE || 'roastly-products';
}
