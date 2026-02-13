import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { productService } from "../services/productService";
import { TRPCError } from "@trpc/server";

/**
 * tRPC router for product operations.
 * All procedures are protected (require authentication).
 */

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  sku: z.string().min(1, "SKU is required").max(100),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
  unitPrice: z.number().positive(),
  minStockLevel: z.number().int().nonnegative(),
});

const updateProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  sku: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  quantity: z.number().int().nonnegative().optional(),
  unitPrice: z.number().positive().optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
});

const deleteProductSchema = z.object({
  id: z.number().int().positive(),
});

const getProductSchema = z.object({
  id: z.number().int().positive(),
});

const listProductsSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  search: z.string().optional(),
  lowStock: z.boolean().optional(),
});

export const productRouter = router({
  /**
   * Get all products with optional filtering.
   */
  list: protectedProcedure
    .input(listProductsSchema.optional())
    .query(async ({ input }) => {
      try {
        const filter = input ? {
          categoryId: input.categoryId,
          search: input.search,
          lowStock: input.lowStock,
        } : undefined;
        return await productService.getAllProducts(filter);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch products",
        });
      }
    }),

  /**
   * Get a single product by ID.
   */
  get: protectedProcedure.input(getProductSchema).query(async ({ input }) => {
    try {
      return await productService.getProductById(input.id);
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: error instanceof Error ? error.message : "Product not found",
      });
    }
  }),

  /**
   * Get products with low stock.
   */
  lowStock: protectedProcedure.query(async () => {
    try {
      return await productService.getLowStockProducts();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch low stock products",
      });
    }
  }),

  /**
   * Get inventory statistics.
   */
  stats: protectedProcedure.query(async () => {
    try {
      return await productService.getInventoryStats();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch inventory stats",
      });
    }
  }),

  /**
   * Create a new product.
   */
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      try {
        return await productService.createProduct(input);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to create product",
        });
      }
    }),

  /**
   * Update an existing product.
   */
  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await productService.updateProduct(id, data);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to update product",
        });
      }
    }),

  /**
   * Delete a product.
   */
  delete: protectedProcedure
    .input(deleteProductSchema)
    .mutation(async ({ input }) => {
      try {
        await productService.deleteProduct(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to delete product",
        });
      }
    }),
});
