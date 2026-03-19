package services

import (
	"time"

	"github.com/google/uuid"
	"github.com/lauralesteves/roastly-api/internal/domain"
	"github.com/lauralesteves/roastly-api/internal/repositories"
)

type ProductsService interface {
	CreateProduct(input *domain.ProductInput) (*domain.Product, error)
	GetProduct(id string) (*domain.Product, error)
	ListProducts() ([]*domain.Product, error)
	UpdateProduct(id string, updates map[string]interface{}) error
	DeleteProduct(id string) error
}

type productsService struct {
	repository repositories.ProductsRepository
}

func NewProductsService(repository repositories.ProductsRepository) ProductsService {
	return &productsService{
		repository: repository,
	}
}

func (s *productsService) CreateProduct(input *domain.ProductInput) (*domain.Product, error) {
	product := &domain.Product{
		ID:        uuid.New().String(),
		Name:      input.Name,
		Price:     input.Price,
		Stock:     input.Stock,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	err := s.repository.Create(product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (s *productsService) GetProduct(id string) (*domain.Product, error) {
	return s.repository.GetByID(id)
}

func (s *productsService) ListProducts() ([]*domain.Product, error) {
	return s.repository.List()
}

func (s *productsService) UpdateProduct(id string, updates map[string]interface{}) error {
	return s.repository.Update(id, updates)
}

func (s *productsService) DeleteProduct(id string) error {
	return s.repository.Delete(id)
}
