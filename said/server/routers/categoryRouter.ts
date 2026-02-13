import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { categoryService } from "../services/categoryService";
import { TRPCError } from "@trpc/server";

/**
 * tRPC router for category operations.
 * All procedures are protected (require authentication).
 */

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().optional(),
});

const deleteCategorySchema = z.object({
  id: z.number().int().positive(),
});

const getCategorySchema = z.object({
  id: z.number().int().positive(),
});

export const categoryRouter = router({
  /**
   * Get all categories.
   */
  list: protectedProcedure.query(async () => {
    try {
      return await categoryService.getAllCategories();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch categories",
      });
    }
  }),

  /**
   * Get a single category by ID.
   */
  get: protectedProcedure.input(getCategorySchema).query(async ({ input }) => {
    try {
      return await categoryService.getCategoryById(input.id);
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: error instanceof Error ? error.message : "Category not found",
      });
    }
  }),

  /**
   * Create a new category.
   */
  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ input }) => {
      try {
        return await categoryService.createCategory(input);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to create category",
        });
      }
    }),

  /**
   * Update an existing category.
   */
  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await categoryService.updateCategory(id, data);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to update category",
        });
      }
    }),

  /**
   * Delete a category.
   */
  delete: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ input }) => {
      try {
        await categoryService.deleteCategory(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to delete category",
        });
      }
    }),
});
