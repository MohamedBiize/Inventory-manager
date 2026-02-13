import { supplierRepository } from "../repositories/supplierRepository";
import type { Supplier, InsertSupplier } from "../../drizzle/schema";

/**
 * Service layer for supplier business logic.
 * Orchestrates repository operations and applies business rules.
 */

export interface SupplierCreateInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface SupplierUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export const supplierService = {
  /**
   * Get all suppliers.
   * @returns Promise<Supplier[]> - Array of all suppliers
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    return supplierRepository.findAll();
  },

  /**
   * Get a supplier by ID.
   * @param id - Supplier ID
   * @returns Promise<Supplier> - Supplier object
   * @throws Error if supplier not found
   */
  async getSupplierById(id: number): Promise<Supplier> {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new Error(`Supplier with ID ${id} not found`);
    }
    return supplier;
  },

  /**
   * Create a new supplier with validation.
   * @param data - Supplier creation data
   * @returns Promise<Supplier> - Created supplier
   * @throws Error if validation fails
   */
  async createSupplier(data: SupplierCreateInput): Promise<Supplier> {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Supplier name is required");
    }

    if (data.name.length > 255) {
      throw new Error("Supplier name must be less than 255 characters");
    }

    // Validate email format if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Prepare insert data
    const insertData: InsertSupplier = {
      name: data.name.trim(),
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      city: data.city?.trim(),
      country: data.country?.trim(),
    };

    return supplierRepository.create(insertData);
  },

  /**
   * Update an existing supplier with validation.
   * @param id - Supplier ID
   * @param data - Partial supplier data
   * @returns Promise<Supplier> - Updated supplier
   * @throws Error if validation fails
   */
  async updateSupplier(
    id: number,
    data: SupplierUpdateInput
  ): Promise<Supplier> {
    // Verify supplier exists
    await this.getSupplierById(id);

    // Validate input fields
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error("Supplier name cannot be empty");
    }

    if (data.name && data.name.length > 255) {
      throw new Error("Supplier name must be less than 255 characters");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Prepare update data
    const updateData: Partial<InsertSupplier> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email?.trim();
    if (data.phone !== undefined) updateData.phone = data.phone?.trim();
    if (data.address !== undefined) updateData.address = data.address?.trim();
    if (data.city !== undefined) updateData.city = data.city?.trim();
    if (data.country !== undefined) updateData.country = data.country?.trim();

    return supplierRepository.update(id, updateData);
  },

  /**
   * Delete a supplier.
   * @param id - Supplier ID
   * @returns Promise<boolean> - True if deletion was successful
   * @throws Error if supplier not found
   */
  async deleteSupplier(id: number): Promise<boolean> {
    await this.getSupplierById(id);
    return supplierRepository.delete(id);
  },

  /**
   * Validate email format.
   * @param email - Email address to validate
   * @returns boolean - True if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
