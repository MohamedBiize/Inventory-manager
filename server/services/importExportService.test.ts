import { describe, it, expect, vi, beforeEach } from "vitest";
import { importExportService } from "./importExportService";

describe("importExportService", () => {
  describe("parseProductsCSV", () => {
    it("should parse valid CSV content", () => {
      const csv = `name,sku,description,categoryId,quantity,unitPrice,minStockLevel
Product A,SKU001,Description A,1,100,10.50,20
Product B,SKU002,Description B,2,50,20.00,10`;

      const result = importExportService.parseProductsCSV(csv);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.valid[0].name).toBe("Product A");
      expect(result.valid[0].sku).toBe("SKU001");
    });

    it("should detect missing required fields", () => {
      const csv = `name,sku,description,categoryId,quantity,unitPrice,minStockLevel
,SKU001,Description A,1,100,10.50,20`;

      const result = importExportService.parseProductsCSV(csv);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("name is required");
    });

    it("should detect invalid category ID", () => {
      const csv = `name,sku,description,categoryId,quantity,unitPrice,minStockLevel
Product A,SKU001,Description A,invalid,100,10.50,20`;

      const result = importExportService.parseProductsCSV(csv);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("category ID");
    });

    it("should detect invalid unit price", () => {
      const csv = `name,sku,description,categoryId,quantity,unitPrice,minStockLevel
Product A,SKU001,Description A,1,100,invalid,20`;

      const result = importExportService.parseProductsCSV(csv);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("unit price");
    });

    it("should handle empty CSV", () => {
      const csv = `name,sku,description,categoryId,quantity,unitPrice,minStockLevel`;

      const result = importExportService.parseProductsCSV(csv);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("parseSuppliersCSV", () => {
    it("should parse valid supplier CSV", () => {
      const csv = `name,email,phone,address,city,country
Supplier A,supplier@test.com,123-456-7890,123 Main St,New York,USA
Supplier B,supplier2@test.com,098-765-4321,456 Oak Ave,Los Angeles,USA`;

      const result = importExportService.parseSuppliersCSV(csv);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.valid[0].name).toBe("Supplier A");
      expect(result.valid[0].email).toBe("supplier@test.com");
    });

    it("should detect missing supplier name", () => {
      const csv = `name,email,phone,address,city,country
,supplier@test.com,123-456-7890,123 Main St,New York,USA`;

      const result = importExportService.parseSuppliersCSV(csv);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("name is required");
    });

    it("should handle optional fields", () => {
      const csv = `name,email,phone,address,city,country
Supplier A,,,,,`;

      const result = importExportService.parseSuppliersCSV(csv);

      expect(result.valid).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.valid[0].email).toBe("");
      expect(result.valid[0].phone).toBe("");
    });
  });

  describe("exportProductsCSV", () => {
    it("should generate CSV header", async () => {
      // Mock productRepository
      vi.mock("../repositories/productRepository", () => ({
        productRepository: {
          findAll: vi.fn().mockResolvedValue([]),
        },
      }));

      const csv = await importExportService.exportProductsCSV();

      expect(csv).toContain("Name");
      expect(csv).toContain("SKU");
      expect(csv).toContain("Quantity");
      expect(csv).toContain("Unit Price");
    });
  });

  describe("exportSuppliersCSV", () => {
    it("should generate CSV header", async () => {
      // Mock supplierRepository
      vi.mock("../repositories/supplierRepository", () => ({
        supplierRepository: {
          findAll: vi.fn().mockResolvedValue([]),
        },
      }));

      const csv = await importExportService.exportSuppliersCSV();

      expect(csv).toContain("Name");
      expect(csv).toContain("Email");
      expect(csv).toContain("Phone");
      expect(csv).toContain("Address");
    });
  });
});
