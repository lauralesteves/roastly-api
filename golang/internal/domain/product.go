package domain

import "errors"

type Product struct {
	ID        string  `json:"id" dynamodbav:"id"`
	Name      string  `json:"name" dynamodbav:"name"`
	Price     float64 `json:"price" dynamodbav:"price"`
	Stock     int     `json:"stock" dynamodbav:"stock"`
	CreatedAt string  `json:"createdAt" dynamodbav:"createdAt"`
}

type ProductInput struct {
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

func (p *ProductInput) Validate() error {
	if p.Name == "" {
		return errors.New("name is required")
	}
	if p.Price < 0 {
		return errors.New("price must be at least 0")
	}
	if p.Stock < 0 {
		return errors.New("stock must be at least 0")
	}
	return nil
}
