import { eq, and } from "drizzle-orm";
import {
  stockMovements,
  type StockMovement,
  type InsertStockMovement,
} from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Repository layer for stock movement operations.
 * Handles all database interactions related to inventory tracking.
 */

export const stockMovementRepository = {
  /**
   * Retrieve all stock movements for a specific product.
   * @param productId - Product ID
   * @returns Promise<StockMovement[]> - Array of stock movements
   */
  async findByProductId(productId: number): Promise<StockMovement[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    return db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId));
  },

  /**
   * Retrieve all stock movements with optional filtering.
   * @returns Promise<StockMovement[]> - Array of all stock movements
   */
  async findAll(): Promise<StockMovement[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    return db.select().from(stockMovements);
  },

  /**
   * Retrieve a single stock movement by ID.
   * @param id - Stock movement ID
   * @returns Promise<StockMovement | undefined> - Stock movement object or undefined if not found
   */
  async findById(id: number): Promise<StockMovement | undefined> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.id, id))
      .limit(1);
    return result[0];
  },

  /**
   * Create a new stock movement record.
   * @param data - Stock movement data to insert
   * @returns Promise<StockMovement> - Created stock movement object
   */
  async create(data: InsertStockMovement): Promise<StockMovement> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    await db.insert(stockMovements).values(data);
    const created = await this.findById(data.productId);
    if (!created) throw new Error("Failed to create stock movement");
    return created;
  },

  /**
   * Get stock movements for a date range.
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<StockMovement[]> - Array of stock movements in the date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<StockMovement[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const allMovements = await this.findAll();
    return allMovements.filter(
      (m) => m.createdAt >= startDate && m.createdAt <= endDate
    );
  },

  /**
   * Get summary statistics for stock movements by type.
   * @param productId - Product ID
   * @returns Promise<Record<string, number>> - Count of movements by type
   */
  async getMovementsSummary(
    productId: number
  ): Promise<Record<string, number>> {
    const movements = await this.findByProductId(productId);
    const summary: Record<string, number> = {
      purchase: 0,
      sale: 0,
      adjustment: 0,
      return: 0,
      damage: 0,
    };

    movements.forEach((m) => {
      if (m.movementType in summary) {
        summary[m.movementType]++;
      }
    });

    return summary;
  },
};
