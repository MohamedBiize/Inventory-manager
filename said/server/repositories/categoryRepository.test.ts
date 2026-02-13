import { describe, it, expect, beforeEach, vi } from "vitest";
import { categoryRepository } from "./categoryRepository";
import { getDb } from "../db";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("categoryRepository", () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockResolvedValue(mockDb);
  });

  describe("findAll", () => {
    it("should return all categories", async () => {
      const mockCategories = [
        { id: 1, name: "Electronics", description: "Electronic items", createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: "Clothing", description: "Clothing items", createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockCategories),
      });

      const result = await categoryRepository.findAll();
      expect(result).toEqual(mockCategories);
    });
  });

  describe("findById", () => {
    it("should return a category by ID", async () => {
      const mockCategory = {
        id: 1,
        name: "Electronics",
        description: "Electronic items",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCategory]),
          }),
        }),
      });

      const result = await categoryRepository.findById(1);
      expect(result).toEqual(mockCategory);
    });

    it("should return undefined if category not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await categoryRepository.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should create a new category", async () => {
      const newCategory = { name: "Books", description: "Book items" };
      const createdCategory = {
        id: 3,
        ...newCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First call to findByName returns undefined (no existing category)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      // Second call to findByName returns the created category
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([createdCategory]),
          }),
        }),
      });

      const result = await categoryRepository.create(newCategory);
      expect(result).toEqual(createdCategory);
    });

    it("should throw error if category name already exists", async () => {
      const existingCategory = {
        id: 1,
        name: "Electronics",
        description: "Electronic items",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingCategory]),
          }),
        }),
      });

      await expect(
        categoryRepository.create({ name: "Electronics", description: "New description" })
      ).rejects.toThrow('Category with name "Electronics" already exists');
    });
  });

  describe("delete", () => {
    it("should delete a category", async () => {
      const mockCategory = {
        id: 1,
        name: "Electronics",
        description: "Electronic items",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCategory]),
          }),
        }),
      });

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const result = await categoryRepository.delete(1);
      expect(result).toBe(true);
    });

    it("should throw error if category not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(categoryRepository.delete(999)).rejects.toThrow(
        "Category with ID 999 not found"
      );
    });
  });
});
