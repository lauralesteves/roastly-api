package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/lauralesteves/roastly-api/internal/domain"
	"github.com/lauralesteves/roastly-api/internal/services"
)

type ProductsController struct {
	service services.ProductsService
}

func NewProductsController(service services.ProductsService) *ProductsController {
	return &ProductsController{
		service: service,
	}
}

func (c *ProductsController) CreateProduct(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.Body == "" {
		log.Printf("Missing request body")
		return BadRequestResponse(nil), nil
	}

	var input domain.ProductInput
	err := json.Unmarshal([]byte(request.Body), &input)
	if err != nil {
		log.Printf("Error unmarshaling product input: %v", err)
		return BadRequestResponse(err), nil
	}

	if err := input.Validate(); err != nil {
		log.Printf("Validation error: %v", err)
		return BadRequestResponse(err), nil
	}

	product, err := c.service.CreateProduct(&input)
	if err != nil {
		log.Printf("Error creating product: %v", err)
		return InternalServerErrorResponse(), nil
	}

	return SuccessResponse(product, http.StatusOK), nil
}

func (c *ProductsController) GetProduct(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	id := request.PathParameters["id"]
	if id == "" {
		log.Printf("Missing product ID")
		return BadRequestResponse(nil), nil
	}

	product, err := c.service.GetProduct(id)
	if err != nil {
		log.Printf("Error getting product: %v", err)
		return InternalServerErrorResponse(), nil
	}

	if product == nil {
		return NotFoundResponse("product"), nil
	}

	return SuccessResponse(product, http.StatusOK), nil
}

func (c *ProductsController) ListProducts(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	products, err := c.service.ListProducts()
	if err != nil {
		log.Printf("Error listing products: %v", err)
		return InternalServerErrorResponse(), nil
	}

	return SuccessResponse(products, http.StatusOK), nil
}

func (c *ProductsController) UpdateProduct(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	id := request.PathParameters["id"]
	if id == "" {
		log.Printf("Missing product ID")
		return BadRequestResponse(nil), nil
	}

	if request.Body == "" {
		log.Printf("Missing request body")
		return BadRequestResponse(nil), nil
	}

	var updates map[string]interface{}
	err := json.Unmarshal([]byte(request.Body), &updates)
	if err != nil {
		log.Printf("Error unmarshaling updates: %v", err)
		return BadRequestResponse(err), nil
	}

	err = c.service.UpdateProduct(id, updates)
	if err != nil {
		log.Printf("Error updating product: %v", err)
		return InternalServerErrorResponse(), nil
	}

	updates["id"] = id
	return SuccessResponse(updates, http.StatusOK), nil
}

func (c *ProductsController) DeleteProduct(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	id := request.PathParameters["id"]
	if id == "" {
		log.Printf("Missing product ID")
		return BadRequestResponse(nil), nil
	}

	err := c.service.DeleteProduct(id)
	if err != nil {
		log.Printf("Error deleting product: %v", err)
		return InternalServerErrorResponse(), nil
	}

	return SuccessResponse(map[string]string{"id": id}, http.StatusOK), nil
}
