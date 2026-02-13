import { stockMovementRepository } from "../repositories/stockMovementRepository";
import { productRepository } from "../repositories/productRepository";
import type { StockMovement, InsertStockMovement } from "../../drizzle/schema";

/**
 * Service layer for stock movement business logic.
 * Handles inventory tracking, updates product quantities, and maintains audit trail.
 */

export type MovementType = "purchase" | "sale" | "adjustment" | "return" | "damage";

export interface StockMovementCreateInput {
  productId: number;
  movementType: MovementType;
  quantity: number;
  reason?: string;
}

export const stockMovementService = {
  /**
   * Get all stock movements.
   * @returns Promise<StockMovement[]> - Array of all stock movements
   */
  async getAllMovements(): Promise<StockMovement[]> {
    return stockMovementRepository.findAll();
  },

  /**
   * Get stock movements for a specific product.
   * @param productId - Product ID
   * @returns Promise<StockMovement[]> - Array of stock movements for the product
   */
  async getMovementsByProduct(productId: number): Promise<StockMovement[]> {
    return stockMovementRepository.findByProductId(productId);
  },

  /**
   * Get stock movements within a date range.
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<StockMovement[]> - Array of stock movements in the date range
   */
  async getMovementsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<StockMovement[]> {
    return stockMovementRepository.findByDateRange(startDate, endDate);
  },

  /**
   * Record a stock movement and update product quantity.
   * @param data - Stock movement data
   * @returns Promise<StockMovement> - Created stock movement
   * @throws Error if validation fails
   */
  async recordMovement(data: StockMovementCreateInput): Promise<StockMovement> {
    // Validate product exists
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new Error(`Product with ID ${data.productId} not found`);
    }

    // Validate quantity
    if (data.quantity <= 0) {
      throw new Error("Movement quantity must be greater than 0");
    }

    // Validate movement type
    const validTypes: MovementType[] = ["purchase", "sale", "adjustment", "return", "damage"];
    if (!validTypes.includes(data.movementType)) {
      throw new Error(`Invalid movement type: ${data.movementType}`);
    }

    // Calculate new quantity based on movement type
    let newQuantity = product.quantity;
    switch (data.movementType) {
      case "purchase":
      case "return":
        newQuantity += data.quantity;
        break;
      case "sale":
      case "damage":
        newQuantity -= data.quantity;
        break;
      case "adjustment":
        // For adjustment, quantity is the new absolute value
        newQuantity = data.quantity;
        break;
    }

    // Validate new quantity is not negative
    if (newQuantity < 0) {
      throw new Error(
        `Insufficient stock. Current: ${product.quantity}, Requested: ${data.quantity}`
      );
    }

    // Create stock movement record
    const insertData: InsertStockMovement = {
      productId: data.productId,
      movementType: data.movementType,
      quantity: data.movementType === "adjustment" ? newQuantity : data.quantity,
      reason: data.reason?.trim(),
    };

    const movement = await stockMovementRepository.create(insertData);

    // Update product quantity
    await productRepository.update(data.productId, {
      quantity: newQuantity,
    });

    return movement;
  },

  /**
   * Get stock movement summary for a product.
   * @param productId - Product ID
   * @returns Promise<Object> - Summary of movements by type
   */
  async getMovementsSummary(
    productId: number
  ): Promise<Record<string, number>> {
    return stockMovementRepository.getMovementsSummary(productId);
  },

  /**
   * Get total quantity moved in/out for a product.
   * @param productId - Product ID
   * @returns Promise<Object> - Total quantities in and out
   */
  async getMovementTotals(
    productId: number
  ): Promise<{ totalIn: number; totalOut: number }> {
    const movements = await this.getMovementsByProduct(productId);

    let totalIn = 0;
    let totalOut = 0;

    movements.forEach((m) => {
      switch (m.movementType) {
        case "purchase":
        case "return":
          totalIn += m.quantity;
          break;
        case "sale":
        case "damage":
          totalOut += m.quantity;
          break;
      }
    });

    return { totalIn, totalOut };
  },
};
