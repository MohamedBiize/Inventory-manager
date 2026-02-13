import { eq, and, gte, lte, like } from "drizzle-orm";
import { products, type Product, type InsertProduct } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Repository layer for product operations.
 * Handles all database interactions related to products.
 * Supports filtering, searching, and pagination.
 */

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  lowStock?: boolean;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export const productRepository = {
  /**
   * Retrieve all products with optional filtering and pagination.
   * @param filter - Optional filter criteria
   * @param pagination - Optional pagination options
   * @returns Promise<Product[]> - Array of products matching criteria
   */
  async findAll(
    filter?: ProductFilter,
    pagination?: PaginationOptions
  ): Promise<Product[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Build WHERE conditions
    const conditions = [];

    if (filter?.categoryId) {
      conditions.push(eq(products.categoryId, filter.categoryId));
    }

    if (filter?.minPrice !== undefined) {
      conditions.push(gte(products.unitPrice, filter.minPrice.toString()));
    }

    if (filter?.maxPrice !== undefined) {
      conditions.push(lte(products.unitPrice, filter.maxPrice.toString()));
    }

    if (filter?.search) {
      conditions.push(like(products.name, `%${filter.search}%`));
    }

    if (filter?.lowStock) {
      conditions.push(lte(products.quantity, products.minStockLevel));
    }

    const baseQuery = conditions.length > 0
      ? db.select().from(products).where(and(...conditions))
      : db.select().from(products);

    if (pagination) {
      return baseQuery.limit(pagination.limit).offset(pagination.offset);
    }

    return baseQuery;
  },

  /**
   * Retrieve a single product by ID.
   * @param id - Product ID
   * @returns Promise<Product | undefined> - Product object or undefined if not found
   */
  async findById(id: number): Promise<Product | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return result[0];
  },

  /**
   * Retrieve a product by SKU.
   * @param sku - Product SKU
   * @returns Promise<Product | undefined> - Product object or undefined if not found
   */
  async findBySku(sku: string): Promise<Product | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);
    return result[0];
  },

  /**
   * Create a new product.
   * @param data - Product data to insert
   * @returns Promise<Product> - Created product object
   */
  async create(data: InsertProduct): Promise<Product> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Check if SKU already exists
    const existing = await this.findBySku(data.sku);
    if (existing) {
      throw new Error(`Product with SKU "${data.sku}" already exists`);
    }

    await db.insert(products).values(data);
    const created = await this.findBySku(data.sku);
    if (!created) throw new Error("Failed to create product");
    return created;
  },

  /**
   * Update an existing product.
   * @param id - Product ID
   * @param data - Partial product data to update
   * @returns Promise<Product> - Updated product object
   */
  async update(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Check if new SKU conflicts with another product
    if (data.sku && data.sku !== existing.sku) {
      const conflict = await this.findBySku(data.sku);
      if (conflict) {
        throw new Error(`Product with SKU "${data.sku}" already exists`);
      }
    }

    await db.update(products).set(data).where(eq(products.id, id));
    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update product");
    return updated;
  },

  /**
   * Delete a product by ID.
   * @param id - Product ID
   * @returns Promise<boolean> - True if deletion was successful
   */
  async delete(id: number): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Product with ID ${id} not found`);
    }

    await db.delete(products).where(eq(products.id, id));
    return true;
  },

  /**
   * Get total count of products matching filter criteria.
   * @param filter - Optional filter criteria
   * @returns Promise<number> - Total count of products
   */
  async count(filter?: ProductFilter): Promise<number> {
    const products_list = await this.findAll(filter);
    return products_list.length;
  },
};
