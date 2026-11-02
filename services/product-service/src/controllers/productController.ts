import {Request, Response} from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../services/productService';
import {CustomError} from '../utils/customError';

function getProductId(req: Request): string {
  const {id} = req.params;
  if (typeof id !== 'string') {
    throw new CustomError('Product ID must be a valid MongoDB ID', 400);
  }
  return id;
}

export async function createProductController(req: Request, res: Response): Promise<void> {
  const product = await createProduct(req.body);
  res.status(201).json({success: true, data: product});
}

export async function getProductsController(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const result = await getProducts(page, limit);
  res.status(200).json({success: true, data: result.products, pagination: result.pagination});
}

export async function getProductController(req: Request, res: Response): Promise<void> {
  const product = await getProductById(getProductId(req));
  res.status(200).json({success: true, data: product});
}

export async function updateProductController(req: Request, res: Response): Promise<void> {
  const product = await updateProduct(getProductId(req), req.body);
  res.status(200).json({success: true, data: product});
}

export async function deleteProductController(req: Request, res: Response): Promise<void> {
  const product = await deleteProduct(getProductId(req));
  res.status(200).json({success: true, data: product});
}
