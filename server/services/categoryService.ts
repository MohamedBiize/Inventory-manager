import { categoryRepository } from "../repositories/categoryRepository";
import type { Category, InsertCategory } from "../../drizzle/schema";

/**
 * Service layer for category business logic.
 * Orchestrates repository operations and applies business rules.
 * This layer sits between tRPC routers and the repository layer.
 */

export const categoryService = {
  /**
   * Get all categories.
   * @returns Promise<Category[]> - Array of all categories
   */
  async getAllCategories(): Promise<Category[]> {
    return categoryRepository.findAll();
  },

  /**
   * Get a category by ID.
   * @param id - Category ID
   * @returns Promise<Category> - Category object
   * @throws Error if category not found
   */
  async getCategoryById(id: number): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  },

  /**
   * Create a new category with validation.
   * @param data - Category data
   * @returns Promise<Category> - Created category
   * @throws Error if validation fails or name already exists
   */
  async createCategory(data: InsertCategory): Promise<Category> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Category name is required and cannot be empty");
    }

    if (data.name.length > 255) {
      throw new Error("Category name must be less than 255 characters");
    }

    // Normalize name (trim whitespace)
    const normalizedData: InsertCategory = {
      ...data,
      name: data.name.trim(),
    };

    return categoryRepository.create(normalizedData);
  },

  /**
   * Update an existing category with validation.
   * @param id - Category ID
   * @param data - Partial category data
   * @returns Promise<Category> - Updated category
   * @throws Error if validation fails or category not found
   */
  async updateCategory(
    id: number,
    data: Partial<InsertCategory>
  ): Promise<Category> {
    // Verify category exists
    await this.getCategoryById(id);

    // Validate input if name is being updated
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error("Category name cannot be empty");
      }

      if (data.name.length > 255) {
        throw new Error("Category name must be less than 255 characters");
      }
    }

    // Normalize name if provided
    const normalizedData: Partial<InsertCategory> = {
      ...data,
      name: data.name ? data.name.trim() : undefined,
    };

    return categoryRepository.update(id, normalizedData);
  },

  /**
   * Delete a category.
   * @param id - Category ID
   * @returns Promise<boolean> - True if deletion was successful
   * @throws Error if category not found
   */
  async deleteCategory(id: number): Promise<boolean> {
    // Verify category exists
    await this.getCategoryById(id);
    return categoryRepository.delete(id);
  },
};
