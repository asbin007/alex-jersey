import { Op } from 'sequelize';
import { sequelize } from '../config/db';
import { Product, SizeStock } from '../models/associations';
import { PaginatedResult } from '../types';
import { ProductFilters, CreateProductDTO, UpdateProductDTO } from '../types/dto';

/**
 * Build a Sequelize where object from product filters.
 * Always includes { isActive: true } to exclude soft-deleted products.
 */
export function buildProductQuery(filters: ProductFilters): any {
  const where: any = { isActive: true };

  if (filters.team) {
    where.team = { [Op.iLike]: `%${filters.team}%` };
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.size) {
    // Subquery to check if the product has the requested size in stock
    where.id = {
      [Op.in]: sequelize.literal(`(
        SELECT "productId" FROM "SizeStocks" 
        WHERE "size" = ${sequelize.escape(filters.size)} AND "stock" > 0
      )`),
    };
  }

  if (filters.priceMin || filters.priceMax) {
    const priceWhere: any = {};
    if (filters.priceMin) priceWhere[Op.gte] = filters.priceMin;
    if (filters.priceMax) priceWhere[Op.lte] = filters.priceMax;
    where.price = priceWhere;
  }

  if (filters.jerseyType) {
    where.jerseyType = filters.jerseyType;
  }

  if (filters.isFeatured !== undefined) {
    where.isFeatured = filters.isFeatured;
  }

  if (filters.isLimitedDrop !== undefined) {
    where.isLimitedDrop = filters.isLimitedDrop;
  }

  return where;
}

/**
 * Get Sequelize sort option from sortBy parameter.
 */
export function getSortOption(sortBy?: string): any {
  switch (sortBy) {
    case 'price':
      return [['price', 'ASC']];
    case 'newest':
      return [['createdAt', 'DESC']];
    case 'popular':
      return [['reviewCount', 'DESC'], ['rating', 'DESC']];
    default:
      return [['createdAt', 'DESC']];
  }
}

/**
 * Get paginated products with filters and sorting.
 */
export async function getProducts(
  filters: ProductFilters
): Promise<PaginatedResult<any>> {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  const where = buildProductQuery(filters);
  const order = getSortOption(filters.sortBy);

  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit,
    offset: skip,
    include: [{ model: SizeStock, as: 'sizes' }],
    distinct: true,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    total: count,
    page,
    totalPages,
    hasNext: page < totalPages,
  };
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id: string): Promise<any | null> {
  return Product.findOne({
    where: { id, isActive: true },
    include: [{ model: SizeStock, as: 'sizes' }],
  });
}

/**
 * Get a single product by ID or slug.
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<any | null> {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);

  const queryWhere: any = isUuid
    ? { id: idOrSlug, isActive: true }
    : { slug: idOrSlug, isActive: true };

  return Product.findOne({
    where: queryWhere,
    include: [{ model: SizeStock, as: 'sizes' }],
  });
}

/**
 * Create a new product.
 */
export async function createProduct(data: CreateProductDTO): Promise<any> {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sequelize.transaction(async (t) => {
    const product = await Product.create({
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      images: data.images,
      category: data.category,
      team: data.team,
      player: data.player,
      jerseyType: data.jerseyType,
      tags: data.tags || [],
      isFeatured: data.isFeatured ?? false,
      isLimitedDrop: data.isLimitedDrop ?? false,
      allowCustomization: data.allowCustomization ?? false,
    }, { transaction: t });

    if (data.sizes && data.sizes.length > 0) {
      await SizeStock.bulkCreate(
        data.sizes.map((s) => ({
          productId: product.id,
          size: s.size,
          stock: s.stock,
        })),
        { transaction: t }
      );
    }

    return Product.findByPk(product.id, {
      include: [{ model: SizeStock, as: 'sizes' }],
      transaction: t,
    });
  });
}

/**
 * Update an existing product by ID.
 */
export async function updateProduct(
  id: string,
  data: UpdateProductDTO
): Promise<any | null> {
  return sequelize.transaction(async (t) => {
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) return null;

    const updateData: any = { ...data };

    if (data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (data.sizes) {
      delete updateData.sizes;

      await SizeStock.destroy({
        where: { productId: id },
        transaction: t,
      });

      await SizeStock.bulkCreate(
        data.sizes.map((s) => ({
          productId: id,
          size: s.size,
          stock: s.stock,
        })),
        { transaction: t }
      );
    }

    await product.update(updateData, { transaction: t });

    return Product.findByPk(id, {
      include: [{ model: SizeStock, as: 'sizes' }],
      transaction: t,
    });
  });
}

/**
 * Soft delete a product by setting isActive to false.
 */
export async function deleteProduct(id: string): Promise<any | null> {
  const product = await Product.findByPk(id);
  if (!product) return null;

  await product.update({ isActive: false });
  return product;
}

/**
 * Get all products for admin (includes inactive).
 */
export async function getAdminProducts(): Promise<any[]> {
  return Product.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: SizeStock, as: 'sizes' }],
  });
}

/**
 * Search products using text matching on name, team, description, or tags.
 */
export async function searchProducts(query: string): Promise<any[]> {
  return Product.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { team: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { tags: { [Op.contains]: [query] } },
      ],
    },
    include: [{ model: SizeStock, as: 'sizes' }],
  });
}

/**
 * Get related products based on same team or category, excluding the current product.
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<any[]> {
  const product = await Product.findByPk(productId);
  if (!product) return [];

  return Product.findAll({
    where: {
      id: { [Op.ne]: productId },
      isActive: true,
      [Op.or]: [
        { team: product.team },
        { category: product.category },
      ],
    },
    limit,
    include: [{ model: SizeStock, as: 'sizes' }],
  });
}

/**
 * Get all active products for sitemap generation.
 */
export async function getAllProductsForSitemap(): Promise<any[]> {
  return Product.findAll({
    where: { isActive: true },
    attributes: ['slug', 'images', 'updatedAt'],
  });
}
