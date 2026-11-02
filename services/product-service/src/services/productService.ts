import {ProductModel} from '../models/productModel';
import {CustomError, DataFoundError} from '../utils/customError';

export interface ProductInput {
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock?: number;
  active?: boolean;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function throwIfDuplicateSku(error: unknown): never {
  if (isDuplicateKeyError(error)) {
    throw new DataFoundError('A product with this SKU already exists');
  }

  throw error;
}

export async function createProduct(input: ProductInput) {
  try {
    return await ProductModel.create(input);
  } catch (error) {
    throwIfDuplicateSku(error);
  }
}

export async function getProducts(page: number, limit: number) {
  const [products, total] = await Promise.all([
    ProductModel.find()
      .sort({createdAt: -1})
      .skip((page - 1) * limit)
      .limit(limit),
    ProductModel.countDocuments(),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await ProductModel.findById(id);

  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  return product;
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    const product = await ProductModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    return product;
  } catch (error) {
    throwIfDuplicateSku(error);
  }
}

export async function deleteProduct(id: string) {
  const product = await ProductModel.findByIdAndDelete(id);

  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  return product;
}
