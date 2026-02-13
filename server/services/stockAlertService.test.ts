import { describe, it, expect, vi, beforeEach } from "vitest";
import { stockAlertService } from "./stockAlertService";

describe("stockAlertService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("methods exist", () => {
    it("should have checkAndAlertStockLevel method", () => {
      expect(typeof stockAlertService.checkAndAlertStockLevel).toBe("function");
    });

    it("should have checkAllProductsStockLevels method", () => {
      expect(typeof stockAlertService.checkAllProductsStockLevels).toBe("function");
    });

    it("should have recordMovementAndAlert method", () => {
      expect(typeof stockAlertService.recordMovementAndAlert).toBe("function");
    });

    it("should have setupPeriodicChecks method", () => {
      expect(typeof stockAlertService.setupPeriodicChecks).toBe("function");
    });
  });

  describe("checkAndAlertStockLevel", () => {
    it("should not throw when product not found", async () => {
      // Mock productRepository to return null
      vi.mock("../repositories/productRepository", () => ({
        productRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      }));

      // Should not throw
      await expect(stockAlertService.checkAndAlertStockLevel(999)).resolves.not.toThrow();
    });
  });

  describe("recordMovementAndAlert", () => {
    it("should accept valid movement types", async () => {
      const validTypes = ["adjustment", "purchase", "sale", "return", "damage"] as const;

      for (const type of validTypes) {
        // Should not throw
        await expect(
          stockAlertService.recordMovementAndAlert(1, type, 10, "Test reason")
        ).resolves.not.toThrow();
      }
    });
  });

  describe("setupPeriodicChecks", () => {
    it("should return a timer interval", () => {
      const interval = stockAlertService.setupPeriodicChecks(1);
      expect(interval).toBeDefined();
      // Clean up
      clearInterval(interval);
    });

    it("should accept custom interval", () => {
      const interval = stockAlertService.setupPeriodicChecks(10);
      expect(interval).toBeDefined();
      // Clean up
      clearInterval(interval);
    });
  });
});
