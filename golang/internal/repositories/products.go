package repositories

import (
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/lauralesteves/roastly-api/internal/domain"
)

type ProductsRepository interface {
	Create(product *domain.Product) error
	GetByID(id string) (*domain.Product, error)
	List() ([]*domain.Product, error)
	Update(id string, updates map[string]interface{}) error
	Delete(id string) error
}

type productsRepository struct {
	client    *dynamodb.Client
	tableName string
}

func NewProductsRepository(client *dynamodb.Client, tableName string) ProductsRepository {
	return &productsRepository{
		client:    client,
		tableName: tableName,
	}
}

func (r *productsRepository) Create(product *domain.Product) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	item, err := attributevalue.MarshalMap(product)
	if err != nil {
		return err
	}

	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(r.tableName),
		Item:      item,
	})
	return err
}

func (r *productsRepository) GetByID(id string) (*domain.Product, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		return nil, err
	}

	if result.Item == nil {
		return nil, nil
	}

	var product domain.Product
	err = attributevalue.UnmarshalMap(result.Item, &product)
	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *productsRepository) List() ([]*domain.Product, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(r.tableName),
	})
	if err != nil {
		return nil, err
	}

	var products []*domain.Product
	for _, item := range result.Items {
		var product domain.Product
		err := attributevalue.UnmarshalMap(item, &product)
		if err != nil {
			log.Printf("Error unmarshaling product: %v", err)
			continue
		}
		products = append(products, &product)
	}

	return products, nil
}

func (r *productsRepository) Update(id string, updates map[string]interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if len(updates) == 0 {
		return nil
	}

	expr := "SET "
	exprNames := map[string]string{}
	exprValues := map[string]types.AttributeValue{}

	i := 0
	for key, val := range updates {
		if i > 0 {
			expr += ", "
		}
		placeholder := "#k" + key
		valuePlaceholder := ":v" + key
		expr += placeholder + " = " + valuePlaceholder
		exprNames[placeholder] = key

		av, err := attributevalue.Marshal(val)
		if err != nil {
			return err
		}
		exprValues[valuePlaceholder] = av
		i++
	}

	_, err := r.client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
		UpdateExpression:          aws.String(expr),
		ExpressionAttributeNames:  exprNames,
		ExpressionAttributeValues: exprValues,
	})
	return err
}

func (r *productsRepository) Delete(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})
	return err
}
