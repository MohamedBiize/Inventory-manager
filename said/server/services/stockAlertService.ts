import { websocketService } from "./websocketService";
import { notificationService } from "./notificationService";
import { productRepository } from "../repositories/productRepository";
import { stockMovementRepository } from "../repositories/stockMovementRepository";

/**
 * Stock Alert Service
 * Monitors stock levels and triggers alerts when thresholds are breached
 */

export const stockAlertService = {
  /**
   * Check stock level and trigger alerts if necessary
   */
  async checkAndAlertStockLevel(productId: number): Promise<void> {
    try {
      const product = await productRepository.findById(productId);
      if (!product) return;

      const quantity = product.quantity;
      const minLevel = product.minStockLevel;

      // Critical alert: out of stock
      if (quantity === 0) {
        await websocketService.broadcastCriticalStockAlert(productId, product.name);
        // Broadcast to all users (no userId needed for WebSocket)
        return;
      }

      // Critical alert: below 20% of minimum level
      if (quantity < minLevel * 0.2) {
        await websocketService.broadcastCriticalStockAlert(productId, product.name);
        return;
      }

      // Warning alert: below minimum level
      if (quantity < minLevel) {
        await websocketService.broadcastLowStockAlert(productId, product.name, quantity, minLevel);
      }
    } catch (error) {
      console.error(`[StockAlert] Error checking stock for product ${productId}:`, error);
    }
  },

  /**
   * Check all products for stock alerts
   */
  async checkAllProductsStockLevels(): Promise<void> {
    try {
      const products = await productRepository.findAll();

      for (const product of products) {
        await this.checkAndAlertStockLevel(product.id);
      }

      console.log(`[StockAlert] Checked ${products.length} products for stock levels`);
    } catch (error) {
      console.error("[StockAlert] Error checking all products:", error);
    }
  },

  /**
   * Record stock movement and check alerts
   */
  async recordMovementAndAlert(
    productId: number,
    movementType: "adjustment" | "purchase" | "sale" | "return" | "damage",
    quantity: number,
    reason?: string
  ): Promise<void> {
    try {
      // Record the movement
      await stockMovementRepository.create({
        productId,
        movementType,
        quantity,
        reason,
      });

      // Get product details
      const product = await productRepository.findById(productId);
      if (product) {
        // Broadcast the movement
        await websocketService.broadcastStockMovement(
          productId,
          product.name,
          movementType,
          quantity,
          reason
        );

        // Check stock levels after movement
        await this.checkAndAlertStockLevel(productId);
      }
    } catch (error) {
      console.error(
        `[StockAlert] Error recording movement for product ${productId}:`,
        error
      );
    }
  },

  /**
   * Set up periodic stock level checks (every 5 minutes)
   */
  setupPeriodicChecks(intervalMinutes: number = 5): ReturnType<typeof setInterval> {
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(
      `[StockAlert] Setting up periodic stock checks every ${intervalMinutes} minutes`
    );

    return setInterval(async () => {
      await this.checkAllProductsStockLevels();
    }, intervalMs);
  },
};
