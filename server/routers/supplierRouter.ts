import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { supplierService } from "../services/supplierService";
import { TRPCError } from "@trpc/server";

/**
 * tRPC router for supplier operations.
 * All procedures are protected (require authentication).
 */

// Validation schemas
const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const updateSupplierSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const deleteSupplierSchema = z.object({
  id: z.number().int().positive(),
});

const getSupplierSchema = z.object({
  id: z.number().int().positive(),
});

export const supplierRouter = router({
  /**
   * Get all suppliers.
   */
  list: protectedProcedure.query(async () => {
    try {
      return await supplierService.getAllSuppliers();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch suppliers",
      });
    }
  }),

  /**
   * Get a single supplier by ID.
   */
  get: protectedProcedure.input(getSupplierSchema).query(async ({ input }) => {
    try {
      return await supplierService.getSupplierById(input.id);
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: error instanceof Error ? error.message : "Supplier not found",
      });
    }
  }),

  /**
   * Create a new supplier.
   */
  create: protectedProcedure
    .input(createSupplierSchema)
    .mutation(async ({ input }) => {
      try {
        return await supplierService.createSupplier(input);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to create supplier",
        });
      }
    }),

  /**
   * Update an existing supplier.
   */
  update: protectedProcedure
    .input(updateSupplierSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await supplierService.updateSupplier(id, data);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to update supplier",
        });
      }
    }),

  /**
   * Delete a supplier.
   */
  delete: protectedProcedure
    .input(deleteSupplierSchema)
    .mutation(async ({ input }) => {
      try {
        await supplierService.deleteSupplier(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to delete supplier",
        });
      }
    }),
});
