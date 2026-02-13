import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { stockMovementService } from "../services/stockMovementService";
import { TRPCError } from "@trpc/server";

/**
 * tRPC router for stock movement operations.
 * All procedures are protected (require authentication).
 * Handles inventory tracking and updates.
 */

// Validation schemas
const recordMovementSchema = z.object({
  productId: z.number().int().positive(),
  movementType: z.enum(["purchase", "sale", "adjustment", "return", "damage"]),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

const getMovementsByProductSchema = z.object({
  productId: z.number().int().positive(),
});

const getMovementsByDateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

const getMovementTotalsSchema = z.object({
  productId: z.number().int().positive(),
});

export const stockMovementRouter = router({
  /**
   * Get all stock movements.
   */
  list: protectedProcedure.query(async () => {
    try {
      return await stockMovementService.getAllMovements();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch stock movements",
      });
    }
  }),

  /**
   * Get stock movements for a specific product.
   */
  byProduct: protectedProcedure
    .input(getMovementsByProductSchema)
    .query(async ({ input }) => {
      try {
        return await stockMovementService.getMovementsByProduct(input.productId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch movements",
        });
      }
    }),

  /**
   * Get stock movements within a date range.
   */
  byDateRange: protectedProcedure
    .input(getMovementsByDateRangeSchema)
    .query(async ({ input }) => {
      try {
        return await stockMovementService.getMovementsByDateRange(
          input.startDate,
          input.endDate
        );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch movements",
        });
      }
    }),

  /**
   * Get movement summary for a product.
   */
  summary: protectedProcedure
    .input(getMovementsByProductSchema)
    .query(async ({ input }) => {
      try {
        return await stockMovementService.getMovementsSummary(input.productId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch summary",
        });
      }
    }),

  /**
   * Get total quantities moved in and out for a product.
   */
  totals: protectedProcedure
    .input(getMovementTotalsSchema)
    .query(async ({ input }) => {
      try {
        return await stockMovementService.getMovementTotals(input.productId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch totals",
        });
      }
    }),

  /**
   * Record a new stock movement.
   */
  record: protectedProcedure
    .input(recordMovementSchema)
    .mutation(async ({ input }) => {
      try {
        return await stockMovementService.recordMovement(input);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to record movement",
        });
      }
    }),
});
