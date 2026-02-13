import { describe, it, expect, beforeEach, vi } from "vitest";
import { productService } from "./productService";
import * as productRepo from "../repositories/productRepository";
import * as categoryRepo from "../repositories/categoryRepository";

// Mock repositories
vi.mock("../repositories/productRepository");
vi.mock("../repositories/categoryRepository");

describe("productService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInventoryStats", () => {
    it("should return correct inventory statistics", async () => {
      const mockProducts = [
        {
          id: 1,
          name: "Product 1",
          sku: "SKU001",
          categoryId: 1,
          quantity: 100,
          unitPrice: "10.00",
          minStockLevel: 20,
          description: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Product 2",
          sku: "SKU002",
          categoryId: 1,
          quantity: 50,
          unitPrice: "20.00",
          minStockLevel: 10,
          description: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(productRepo.productRepository, "findAll")
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockProducts);

      const stats = await productService.getInventoryStats();

      expect(stats.totalProducts).toBe(2);
      expect(stats.totalValue).toBe(100 * 10 + 50 * 20); // 2000
      expect(stats.averagePrice).toBe(15); // (10 + 20) / 2
      expect(stats.lowStockCount).toBe(0);
    });

    it("should count low stock products correctly", async () => {
      const mockProducts = [
        {
          id: 1,
          name: "Product 1",
          sku: "SKU001",
          categoryId: 1,
          quantity: 5,
          unitPrice: "10.00",
          minStockLevel: 20,
          description: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(productRepo.productRepository, "findAll")
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce(mockProducts);

      const stats = await productService.getInventoryStats();

      expect(stats.lowStockCount).toBe(1);
    });
  });

  describe("createProduct", () => {
    it("should create a product with valid data", async () => {
      const mockCategory = {
        id: 1,
        name: "Electronics",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newProduct = {
        name: "New Product",
        sku: "SKU003",
        categoryId: 1,
        quantity: 100,
        unitPrice: 25.99,
        minStockLevel: 10,
      };

      vi.spyOn(categoryRepo.categoryRepository, "findById").mockResolvedValue(mockCategory);
      vi.spyOn(productRepo.productRepository, "create").mockResolvedValue({
        id: 3,
        ...newProduct,
        unitPrice: "25.99",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await productService.createProduct(newProduct);

      expect(result.name).toBe("New Product");
      expect(result.sku).toBe("SKU003");
    });

    it("should throw error if product name is empty", async () => {
      const invalidProduct = {
        name: "",
        sku: "SKU003",
        categoryId: 1,
        quantity: 100,
        unitPrice: 25.99,
        minStockLevel: 10,
      };

      await expect(productService.createProduct(invalidProduct)).rejects.toThrow(
        "Product name is required"
      );
    });

    it("should throw error if unit price is invalid", async () => {
      const invalidProduct = {
        name: "Product",
        sku: "SKU003",
        categoryId: 1,
        quantity: 100,
        unitPrice: -10,
        minStockLevel: 10,
      };

      await expect(productService.createProduct(invalidProduct)).rejects.toThrow(
        "Product unit price must be greater than 0"
      );
    });

    it("should throw error if category does not exist", async () => {
      vi.spyOn(categoryRepo.categoryRepository, "findById").mockResolvedValue(undefined);

      const newProduct = {
        name: "New Product",
        sku: "SKU003",
        categoryId: 999,
        quantity: 100,
        unitPrice: 25.99,
        minStockLevel: 10,
      };

      await expect(productService.createProduct(newProduct)).rejects.toThrow(
        "Category with ID 999 not found"
      );
    });
  });

  describe("getLowStockProducts", () => {
    it("should return products with low stock", async () => {
      const mockLowStockProducts = [
        {
          id: 1,
          name: "Low Stock Product",
          sku: "SKU001",
          categoryId: 1,
          quantity: 5,
          unitPrice: "10.00",
          minStockLevel: 20,
          description: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(productRepo.productRepository, "findAll").mockResolvedValue(mockLowStockProducts);

      const result = await productService.getLowStockProducts();

      expect(result).toEqual(mockLowStockProducts);
    });
  });
});
