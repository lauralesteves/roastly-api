package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/lauralesteves/roastly-api/internal/config"
	"github.com/lauralesteves/roastly-api/internal/controllers"
	"github.com/lauralesteves/roastly-api/internal/repositories"
	"github.com/lauralesteves/roastly-api/internal/services"
)

func main() {
	client := config.NewDynamoDBClient()
	repo := repositories.NewProductsRepository(client, config.GetProductsTableName())
	svc := services.NewProductsService(repo)
	ctrl := controllers.NewProductsController(svc)

	lambda.Start(ctrl.GetProduct)
}
