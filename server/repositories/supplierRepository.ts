import { eq } from "drizzle-orm";
import { suppliers, type Supplier, type InsertSupplier } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Repository layer for supplier operations.
 * Handles all database interactions related to suppliers.
 */

export const supplierRepository = {
  /**
   * Retrieve all suppliers from the database.
   * @returns Promise<Supplier[]> - Array of all suppliers
   */
  async findAll(): Promise<Supplier[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    return db.select().from(suppliers);
  },

  /**
   * Retrieve a single supplier by ID.
   * @param id - Supplier ID
   * @returns Promise<Supplier | undefined> - Supplier object or undefined if not found
   */
  async findById(id: number): Promise<Supplier | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);
    return result[0];
  },

  /**
   * Retrieve a supplier by name.
   * @param name - Supplier name
   * @returns Promise<Supplier | undefined> - Supplier object or undefined if not found
   */
  async findByName(name: string): Promise<Supplier | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, name))
      .limit(1);
    return result[0];
  },

  /**
   * Create a new supplier.
   * @param data - Supplier data to insert
   * @returns Promise<Supplier> - Created supplier object
   */
  async create(data: InsertSupplier): Promise<Supplier> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Check if supplier with same name already exists
    const existing = await this.findByName(data.name);
    if (existing) {
      throw new Error(`Supplier with name "${data.name}" already exists`);
    }

    await db.insert(suppliers).values(data);
    const created = await this.findByName(data.name);
    if (!created) throw new Error("Failed to create supplier");
    return created;
  },

  /**
   * Update an existing supplier.
   * @param id - Supplier ID
   * @param data - Partial supplier data to update
   * @returns Promise<Supplier> - Updated supplier object
   */
  async update(id: number, data: Partial<InsertSupplier>): Promise<Supplier> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Supplier with ID ${id} not found`);
    }

    // Check if new name conflicts with another supplier
    if (data.name && data.name !== existing.name) {
      const conflict = await this.findByName(data.name);
      if (conflict) {
        throw new Error(`Supplier with name "${data.name}" already exists`);
      }
    }

    await db.update(suppliers).set(data).where(eq(suppliers.id, id));
    const updated = await this.findById(id);
    if (!updated) throw new Error("Failed to update supplier");
    return updated;
  },

  /**
   * Delete a supplier by ID.
   * @param id - Supplier ID
   * @returns Promise<boolean> - True if deletion was successful
   */
  async delete(id: number): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Supplier with ID ${id} not found`);
    }

    await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  },
};
