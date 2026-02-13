import { eq } from "drizzle-orm";
import { categories, type Category, type InsertCategory } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Repository layer for category operations.
 * Handles all database interactions related to categories.
 * This layer provides a clean abstraction for data access.
 */

export const categoryRepository = {
  /**
   * Retrieve all categories from the database.
   * @returns Promise<Category[]> - Array of all categories
   */
  async findAll(): Promise<Category[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    return db.select().from(categories);
  },

  /**
   * Retrieve a single category by ID.
   * @param id - Category ID
   * @returns Promise<Category | undefined> - Category object or undefined if not found
   */
  async findById(id: number): Promise<Category | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return result[0];
  },

  /**
   * Retrieve a category by name.
   * @param name - Category name
   * @returns Promise<Category | undefined> - Category object or undefined if not found
   */
  async findByName(name: string): Promise<Category | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);
    return result[0];
  },

  /**
   * Create a new category.
   * @param data - Category data to insert
   * @returns Promise<Category> - Created category object
   */
  async create(data: InsertCategory): Promise<Category> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Check if category with same name already exists
    const existing = await this.findByName(data.name);
    if (existing) {
      throw new Error(`Category with name "${data.name}" already exists`);
    }

    await db.insert(categories).values(data);
    const created = await this.findByName(data.name);
    if (!created) throw new Error("Failed to create category");
    return created;
  },

  /**
   * Update an existing category.
   * @param id - Category ID
   * @param data - Partial category data to update
   * @returns Promise<Category> - Updated category object
   */
  async update(id: number, data: Partial<InsertCategory>): Promise<Category> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Verify category exists
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Check if new name conflicts with another category
    if (data.name && data.name !== existing.name) {
      const conflict = await this.findByName(data.name);
      if (conflict) {
        throw new Error(`Category with name "${data.name}" already exists`);
      }
    }

    await db.update(categories).set(data).where(eq(categories.id, id));
    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update category");
    return updated;
  },

  /**
   * Delete a category by ID.
   * @param id - Category ID
   * @returns Promise<boolean> - True if deletion was successful
   */
  async delete(id: number): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Category with ID ${id} not found`);
    }

    await db.delete(categories).where(eq(categories.id, id));
    return true;
  },
};
