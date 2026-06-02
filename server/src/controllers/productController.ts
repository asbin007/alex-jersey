import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as productService from '../services/productService';
import { ProductFilters } from '../types/dto';
import Product from '../models/Product';

/**
 * GET /api/products
 * Returns paginated products with optional filters and sorting.
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const filters: ProductFilters = {
      team: req.query.team as string | undefined,
      category: req.query.category as ProductFilters['category'],
      size: req.query.size as ProductFilters['size'],
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      jerseyType: req.query.jerseyType as ProductFilters['jerseyType'],
      sortBy: req.query.sortBy as ProductFilters['sortBy'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    // Handle text search query
    if (req.query.search) {
      const results = await productService.searchProducts(req.query.search as string);
      res.json({ data: results, total: results.length, page: 1, totalPages: 1, hasNext: false });
      return;
    }

    const result = await productService.getProducts(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

/**
 * GET /api/products/:idOrSlug
 * Returns a single product by ID or slug.
 */
export async function getProductByIdOrSlug(req: Request, res: Response): Promise<void> {
  try {
    const { idOrSlug } = req.params;
    const product = await productService.getProductByIdOrSlug(idOrSlug);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

/**
 * GET /api/products/:id/related
 * Returns related products based on same team or category.
 */
export async function getRelatedProducts(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 4;

    const products = await productService.getRelatedProducts(id, limit);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch related products' });
  }
}

/**
 * POST /api/admin/products
 * Creates a new product (admin only).
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'A product with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
}

/**
 * PUT /api/admin/products/:id
 * Updates an existing product (admin only).
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'A product with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
}

/**
 * DELETE /api/admin/products/:id
 * Soft deletes a product by setting isActive to false (admin only).
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

/**
 * POST /api/products/:id/validate-customization
 * Validates whether a product allows customization and checks field-level rules.
 * Returns 400 if customization is not allowed but customName/customNumber are provided,
 * or if customName/customNumber violate format rules.
 *
 * customName rules: max 20 characters, letters and spaces only
 * customNumber rules: integer between 0 and 99
 */
export async function validateCustomization(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { customName, customNumber } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (!product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const hasCustomName = customName !== undefined && customName !== null && customName !== '';
    const hasCustomNumber = customNumber !== undefined && customNumber !== null && customNumber !== '';

    // Validate customName format
    if (hasCustomName) {
      if (typeof customName !== 'string' || customName.length > 20) {
        res.status(400).json({ error: 'Custom name must not exceed 20 characters', valid: false });
        return;
      }
      if (!/^[a-zA-Z\s]*$/.test(customName)) {
        res.status(400).json({ error: 'Custom name must contain only letters and spaces', valid: false });
        return;
      }
    }

    // Validate customNumber range
    if (hasCustomNumber) {
      const num = Number(customNumber);
      if (!Number.isInteger(num) || num < 0 || num > 99) {
        res.status(400).json({ error: 'Custom number must be an integer between 0 and 99', valid: false });
        return;
      }
    }

    // If no customization data provided, always valid
    if (!hasCustomName && !hasCustomNumber) {
      res.json({ allowCustomization: product.allowCustomization, valid: true });
      return;
    }

    // If customization data provided but product doesn't allow it
    if (!product.allowCustomization) {
      res.status(400).json({
        error: `Product "${product.name}" does not allow customization`,
        allowCustomization: false,
        valid: false,
      });
      return;
    }

    // Customization is allowed and data is valid
    res.json({
      allowCustomization: true,
      valid: true,
      customName,
      customNumber,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to validate customization' });
  }
}
