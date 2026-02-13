import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { importExportService } from "../services/importExportService";
import * as permissionService from "../services/permissionService";

/**
 * Import/Export Router
 * Provides tRPC endpoints for CSV imports and PDF exports.
 */

export const importExportRouter = router({
  /**
   * Parse and validate products CSV
   */
  parseProductsCSV: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .query(({ input }) => {
      return importExportService.parseProductsCSV(input.csvContent);
    }),

  /**
   * Parse and validate suppliers CSV
   */
  parseSuppliersCSV: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .query(({ input }) => {
      return importExportService.parseSuppliersCSV(input.csvContent);
    }),

  /**
   * Import products from CSV
   */
  importProducts: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permission
      permissionService.requirePermission(ctx.user, "create", "product");

      const { valid, errors: parseErrors } = importExportService.parseProductsCSV(input.csvContent);

      if (valid.length === 0) {
        return {
          success: 0,
          failed: parseErrors.length,
          errors: parseErrors.map((e) => `Row ${e.row}: ${e.error}`),
        };
      }

      return importExportService.importProducts(valid);
    }),

  /**
   * Import suppliers from CSV
   */
  importSuppliers: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permission
      permissionService.requirePermission(ctx.user, "create", "supplier");

      const { valid, errors: parseErrors } = importExportService.parseSuppliersCSV(input.csvContent);

      if (valid.length === 0) {
        return {
          success: 0,
          failed: parseErrors.length,
          errors: parseErrors.map((e) => `Row ${e.row}: ${e.error}`),
        };
      }

      return importExportService.importSuppliers(valid);
    }),

  /**
   * Export products as CSV
   */
  exportProductsCSV: protectedProcedure.query(async ({ ctx }) => {
    // Check permission
    permissionService.requirePermission(ctx.user, "view", "product");

    const csv = await importExportService.exportProductsCSV();
    return {
      filename: `products_${new Date().toISOString().split("T")[0]}.csv`,
      content: csv,
    };
  }),

  /**
   * Export suppliers as CSV
   */
  exportSuppliersCSV: protectedProcedure.query(async ({ ctx }) => {
    // Check permission
    permissionService.requirePermission(ctx.user, "view", "supplier");

    const csv = await importExportService.exportSuppliersCSV();
    return {
      filename: `suppliers_${new Date().toISOString().split("T")[0]}.csv`,
      content: csv,
    };
  }),

  /**
   * Generate inventory PDF report
   */
  generateInventoryPDF: protectedProcedure.query(async ({ ctx }) => {
    // Check permission
    permissionService.requirePermission(ctx.user, "view", "report");

    const pdfBuffer = await importExportService.generateInventoryPDF();
    return {
      filename: `inventory_report_${new Date().toISOString().split("T")[0]}.pdf`,
      content: pdfBuffer.toString("base64"),
    };
  }),
});
