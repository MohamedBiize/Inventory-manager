import { productRepository, type ProductFilter } from "../repositories/productRepository";
import { categoryRepository } from "../repositories/categoryRepository";
import type { Product, InsertProduct } from "../../drizzle/schema";

/**
 * Service layer for product business logic.
 * Orchestrates repository operations and applies business rules.
 * Handles validation, category verification, and inventory calculations.
 */

export interface ProductCreateInput {
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
  quantity: number;
  unitPrice: number;
  minStockLevel: number;
}

export interface ProductUpdateInput {
  name?: string;
  sku?: string;
  description?: string;
  categoryId?: number;
  quantity?: number;
  unitPrice?: number;
  minStockLevel?: number;
}

export const productService = {
  /**
   * Get all products with optional filtering.
   * @param filter - Optional filter criteria
   * @returns Promise<Product[]> - Array of products
   */
  async getAllProducts(filter?: ProductFilter): Promise<Product[]> {
    return productRepository.findAll(filter);
  },

  /**
   * Get a product by ID.
   * @param id - Product ID
   * @returns Promise<Product> - Product object
   * @throws Error if product not found
   */
  async getProductById(id: number): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  },

  /**
   * Get products with low stock (quantity <= minStockLevel).
   * @returns Promise<Product[]> - Array of low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    return productRepository.findAll({ lowStock: true });
  },

  /**
   * Get total inventory value (sum of quantity * unitPrice).
   * @returns Promise<number> - Total inventory value
   */
  async getTotalInventoryValue(): Promise<number> {
    const allProducts = await productRepository.findAll();
    return allProducts.reduce((total, product) => {
      const price = typeof product.unitPrice === "string"
        ? parseFloat(product.unitPrice)
        : product.unitPrice;
      return total + (product.quantity * price);
    }, 0);
  },

  /**
   * Get inventory statistics.
   * @returns Promise<Object> - Statistics including total products, total value, low stock count
   */
  async getInventoryStats(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    averagePrice: number;
  }> {
    const allProducts = await productRepository.findAll();
    const lowStockProducts = await this.getLowStockProducts();

    const totalValue = allProducts.reduce((total, product) => {
      const price = typeof product.unitPrice === "string"
        ? parseFloat(product.unitPrice)
        : product.unitPrice;
      return total + (product.quantity * price);
    }, 0);

    const averagePrice = allProducts.length > 0
      ? allProducts.reduce((sum, product) => {
        const price = typeof product.unitPrice === "string"
          ? parseFloat(product.unitPrice)
          : product.unitPrice;
        return sum + price;
      }, 0) / allProducts.length
      : 0;

    return {
      totalProducts: allProducts.length,
      totalValue,
      lowStockCount: lowStockProducts.length,
      averagePrice,
    };
  },

  /**
   * Create a new product with validation.
   * @param data - Product creation data
   * @returns Promise<Product> - Created product
   * @throws Error if validation fails
   */
  async createProduct(data: ProductCreateInput): Promise<Product> {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Product name is required");
    }

    if (!data.sku || data.sku.trim().length === 0) {
      throw new Error("Product SKU is required");
    }

    if (data.quantity < 0) {
      throw new Error("Product quantity cannot be negative");
    }

    if (data.unitPrice <= 0) {
      throw new Error("Product unit price must be greater than 0");
    }

    if (data.minStockLevel < 0) {
      throw new Error("Minimum stock level cannot be negative");
    }

    // Verify category exists
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error(`Category with ID ${data.categoryId} not found`);
    }

    // Create product
    const insertData: InsertProduct = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      description: data.description?.trim(),
      categoryId: data.categoryId,
      quantity: data.quantity,
      unitPrice: data.unitPrice.toString(),
      minStockLevel: data.minStockLevel,
    };

    return productRepository.create(insertData);
  },

  /**
   * Update an existing product with validation.
   * @param id - Product ID
   * @param data - Partial product data
   * @returns Promise<Product> - Updated product
   * @throws Error if validation fails
   */
  async updateProduct(id: number, data: ProductUpdateInput): Promise<Product> {
    // Verify product exists
    await this.getProductById(id);

    // Validate input fields
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error("Product name cannot be empty");
    }

    if (data.sku !== undefined && data.sku.trim().length === 0) {
      throw new Error("Product SKU cannot be empty");
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("Product quantity cannot be negative");
    }

    if (data.unitPrice !== undefined && data.unitPrice <= 0) {
      throw new Error("Product unit price must be greater than 0");
    }

    if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
      throw new Error("Minimum stock level cannot be negative");
    }

    // Verify category exists if being updated
    if (data.categoryId !== undefined) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new Error(`Category with ID ${data.categoryId} not found`);
      }
    }

    // Prepare update data
    const updateData: Partial<InsertProduct> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.sku !== undefined) updateData.sku = data.sku.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim();
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice.toString();
    if (data.minStockLevel !== undefined) updateData.minStockLevel = data.minStockLevel;

    return productRepository.update(id, updateData);
  },

  /**
   * Delete a product.
   * @param id - Product ID
   * @returns Promise<boolean> - True if deletion was successful
   * @throws Error if product not found
   */
  async deleteProduct(id: number): Promise<boolean> {
    await this.getProductById(id);
    return productRepository.delete(id);
  },
};
