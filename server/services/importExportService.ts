import Papa from "papaparse";
import PDFDocument from "pdfkit";
import { productRepository } from "../repositories/productRepository";
import { supplierRepository } from "../repositories/supplierRepository";
import { categoryRepository } from "../repositories/categoryRepository";
import { Product, Supplier } from "../../drizzle/schema";

/**
 * Import/Export Service
 * Handles CSV imports and PDF exports for inventory data.
 */

interface ParsedProduct {
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  quantity: string;
  unitPrice: string;
  minStockLevel: string;
}

interface ParsedSupplier {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export const importExportService = {
  /**
   * Parse CSV content and validate product data
   */
  parseProductsCSV(csvContent: string): {
    valid: ParsedProduct[];
    errors: Array<{ row: number; error: string }>;
  } {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    const valid: ParsedProduct[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    results.data.forEach((row: any, index: number) => {
      try {
        // Validate required fields
        if (!row.name || !row.name.trim()) {
          throw new Error("Product name is required");
        }
        if (!row.sku || !row.sku.trim()) {
          throw new Error("SKU is required");
        }
        if (!row.categoryId || isNaN(parseInt(row.categoryId))) {
          throw new Error("Valid category ID is required");
        }
        if (!row.unitPrice || isNaN(parseFloat(row.unitPrice))) {
          throw new Error("Valid unit price is required");
        }

        valid.push({
          name: row.name.trim(),
          sku: row.sku.trim(),
          description: row.description?.trim(),
          categoryId: row.categoryId,
          quantity: row.quantity || "0",
          unitPrice: row.unitPrice,
          minStockLevel: row.minStockLevel || "0",
        });
      } catch (error) {
        errors.push({
          row: index + 2,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    return { valid, errors };
  },

  /**
   * Parse CSV content and validate supplier data
   */
  parseSuppliersCSV(csvContent: string): {
    valid: ParsedSupplier[];
    errors: Array<{ row: number; error: string }>;
  } {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    const valid: ParsedSupplier[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    results.data.forEach((row: any, index: number) => {
      try {
        if (!row.name || !row.name.trim()) {
          throw new Error("Supplier name is required");
        }

        valid.push({
          name: row.name.trim(),
          email: row.email?.trim(),
          phone: row.phone?.trim(),
          address: row.address?.trim(),
          city: row.city?.trim(),
          country: row.country?.trim(),
        });
      } catch (error) {
        errors.push({
          row: index + 2,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    return { valid, errors };
  },

  /**
   * Import products from parsed CSV data
   */
  async importProducts(
    parsedProducts: ParsedProduct[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const product of parsedProducts) {
      try {
        // Verify category exists
        const category = await categoryRepository.findById(parseInt(product.categoryId));
        if (!category) {
          errors.push(`Product "${product.name}": Category ${product.categoryId} not found`);
          failed++;
          continue;
        }

        // Create product
        const unitPrice = parseFloat(product.unitPrice);
        await productRepository.create({
          name: product.name,
          sku: product.sku,
          description: product.description,
          categoryId: parseInt(product.categoryId),
          quantity: parseInt(product.quantity),
          unitPrice: unitPrice as any,
          minStockLevel: parseInt(product.minStockLevel),
        });

        success++;
      } catch (error) {
        failed++;
        errors.push(
          `Product "${product.name}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return { success, failed, errors };
  },

  /**
   * Import suppliers from parsed CSV data
   */
  async importSuppliers(
    parsedSuppliers: ParsedSupplier[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const supplier of parsedSuppliers) {
      try {
        await supplierRepository.create(supplier);
        success++;
      } catch (error) {
        failed++;
        errors.push(
          `Supplier "${supplier.name}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return { success, failed, errors };
  },

  /**
   * Export products to CSV
   */
  async exportProductsCSV(): Promise<string> {
    const products = await productRepository.findAll();

    const headers = ["Name", "SKU", "Category ID", "Quantity", "Unit Price", "Min Stock Level", "Description"];
    const rows = products.map((p) => [
      p.name,
      p.sku,
      p.categoryId,
      p.quantity,
      p.unitPrice,
      p.minStockLevel,
      p.description || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    return csv;
  },

  /**
   * Export suppliers to CSV
   */
  async exportSuppliersCSV(): Promise<string> {
    const suppliers = await supplierRepository.findAll();

    const headers = ["Name", "Email", "Phone", "Address", "City", "Country"];
    const rows = suppliers.map((s) => [
      s.name,
      s.email || "",
      s.phone || "",
      s.address || "",
      s.city || "",
      s.country || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    return csv;
  },

  /**
   * Generate PDF report for inventory
   */
  async generateInventoryPDF(): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    // Title
    doc.fontSize(24).font("Helvetica-Bold").text("Inventory Report", 100, 50);
    doc.fontSize(12).font("Helvetica").text(`Generated: ${new Date().toLocaleString()}`, 100, 80);

    // Get data
    const products = await productRepository.findAll();
    const categories = await categoryRepository.findAll();
    const suppliers = await supplierRepository.findAll();

    // Summary section
    doc.fontSize(16).font("Helvetica-Bold").text("Summary", 100, 120);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Products: ${products.length}`, 100, 145);
    doc.text(`Total Categories: ${categories.length}`, 100, 165);
    doc.text(`Total Suppliers: ${suppliers.length}`, 100, 185);

    const totalValue = products.reduce(
      (sum, p) => sum + (typeof p.unitPrice === "string" ? parseFloat(p.unitPrice) : p.unitPrice) * p.quantity,
      0
    );
    doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 100, 205);

    // Products section
    doc.fontSize(16).font("Helvetica-Bold").text("Products", 100, 250);

    let yPosition = 280;
    const pageHeight = doc.page.height;
    const margin = 50;

    for (const product of products.slice(0, 20)) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.fontSize(10).font("Helvetica-Bold").text(product.name, 100, yPosition);
      doc.fontSize(9).font("Helvetica");
      doc.text(`SKU: ${product.sku} | Qty: ${product.quantity} | Price: $${product.unitPrice}`, 100, yPosition + 15);
      yPosition += 40;
    }

    if (products.length > 20) {
      doc.text(`... and ${products.length - 20} more products`, 100, yPosition);
    }

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", reject);
    });
  },
};
