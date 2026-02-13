import { User } from "../../drizzle/schema";

/**
 * Permission Service
 * Handles role-based and granular permission checks.
 * Supports three roles: viewer (read-only), manager (CRUD), admin (full access)
 */

export type UserRole = "viewer" | "manager" | "admin";
export type Permission = "view" | "create" | "edit" | "delete";
export type ResourceType = "product" | "supplier" | "category" | "user" | "report";

/**
 * Role-based permission matrix
 * Defines what each role can do on each resource type
 */
const rolePermissions: Record<UserRole, Record<ResourceType, Permission[]>> = {
  viewer: {
    product: ["view"],
    supplier: ["view"],
    category: ["view"],
    user: [],
    report: ["view"],
  },
  manager: {
    product: ["view", "create", "edit"],
    supplier: ["view", "create", "edit"],
    category: ["view", "create", "edit"],
    user: [],
    report: ["view"],
  },
  admin: {
    product: ["view", "create", "edit", "delete"],
    supplier: ["view", "create", "edit", "delete"],
    category: ["view", "create", "edit", "delete"],
    user: ["view", "create", "edit", "delete"],
    report: ["view"],
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 * @param user - The user object with role
 * @param permission - The permission to check (view, create, edit, delete)
 * @param resourceType - The type of resource (product, supplier, etc.)
 * @returns true if user has permission, false otherwise
 */
export function hasPermission(
  user: User,
  permission: Permission,
  resourceType: ResourceType
): boolean {
  if (!user) return false;

  const userRole = user.role as UserRole;
  const allowedPermissions = rolePermissions[userRole]?.[resourceType] || [];

  return allowedPermissions.includes(permission);
}

/**
 * Check if user can view a resource
 */
export function canView(user: User, resourceType: ResourceType): boolean {
  return hasPermission(user, "view", resourceType);
}

/**
 * Check if user can create a resource
 */
export function canCreate(user: User, resourceType: ResourceType): boolean {
  return hasPermission(user, "create", resourceType);
}

/**
 * Check if user can edit a resource
 */
export function canEdit(user: User, resourceType: ResourceType): boolean {
  return hasPermission(user, "edit", resourceType);
}

/**
 * Check if user can delete a resource
 */
export function canDelete(user: User, resourceType: ResourceType): boolean {
  return hasPermission(user, "delete", resourceType);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user?.role === "admin";
}

/**
 * Check if user is manager or admin
 */
export function isManagerOrAdmin(user: User): boolean {
  return user?.role === "manager" || user?.role === "admin";
}

/**
 * Get all permissions for a user on a specific resource type
 */
export function getUserPermissions(user: User, resourceType: ResourceType): Permission[] {
  if (!user) return [];

  const userRole = user.role as UserRole;
  return rolePermissions[userRole]?.[resourceType] || [];
}

/**
 * Get all resource types a user can access
 */
export function getAccessibleResources(user: User): ResourceType[] {
  if (!user) return [];

  const userRole = user.role as UserRole;
  const resourceTypes: ResourceType[] = ["product", "supplier", "category", "user", "report"];

  return resourceTypes.filter((resource) => {
    const permissions = rolePermissions[userRole]?.[resource] || [];
    return permissions.length > 0;
  });
}

/**
 * Permission error for throwing in procedures
 */
export class PermissionError extends Error {
  constructor(message: string = "Permission denied") {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Throw if user doesn't have permission
 */
export function requirePermission(
  user: User,
  permission: Permission,
  resourceType: ResourceType
): void {
  if (!hasPermission(user, permission, resourceType)) {
    throw new PermissionError(
      `You don't have permission to ${permission} ${resourceType}s`
    );
  }
}

/**
 * Throw if user is not admin
 */
export function requireAdmin(user: User): void {
  if (!isAdmin(user)) {
    throw new PermissionError("Admin access required");
  }
}

/**
 * Throw if user is not manager or admin
 */
export function requireManagerOrAdmin(user: User): void {
  if (!isManagerOrAdmin(user)) {
    throw new PermissionError("Manager or admin access required");
  }
}
