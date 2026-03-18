import Joi from 'joi';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
}

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
}

export const productInputSchema = Joi.object<ProductInput>({
  name: Joi.string().min(1).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
});

export function validateProductInput(data: ProductInput): {
  valid: boolean;
  value?: ProductInput;
  error?: string;
} {
  const { value, error } = productInputSchema.validate(data, { abortEarly: false });
  return {
    valid: !error,
    value,
    error: error?.details.map((d) => d.message).join(', '),
  };
}
