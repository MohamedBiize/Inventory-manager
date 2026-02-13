import { describe, it, expect } from "vitest";
import {
  hasPermission,
  canView,
  canCreate,
  canEdit,
  canDelete,
  isAdmin,
  isManagerOrAdmin,
  getUserPermissions,
  getAccessibleResources,
  PermissionError,
  requirePermission,
  requireAdmin,
  requireManagerOrAdmin,
} from "./permissionService";
import { User } from "../../drizzle/schema";

describe("permissionService", () => {
  const adminUser: User = {
    id: 1,
    openId: "admin-1",
    name: "Admin User",
    email: "admin@test.com",
    loginMethod: "oauth",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const managerUser: User = {
    id: 2,
    openId: "manager-1",
    name: "Manager User",
    email: "manager@test.com",
    loginMethod: "oauth",
    role: "manager",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const viewerUser: User = {
    id: 3,
    openId: "viewer-1",
    name: "Viewer User",
    email: "viewer@test.com",
    loginMethod: "oauth",
    role: "viewer",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  describe("hasPermission", () => {
    it("should grant admin all permissions", () => {
      expect(hasPermission(adminUser, "view", "product")).toBe(true);
      expect(hasPermission(adminUser, "create", "product")).toBe(true);
      expect(hasPermission(adminUser, "edit", "product")).toBe(true);
      expect(hasPermission(adminUser, "delete", "product")).toBe(true);
    });

    it("should grant manager view, create, edit permissions", () => {
      expect(hasPermission(managerUser, "view", "product")).toBe(true);
      expect(hasPermission(managerUser, "create", "product")).toBe(true);
      expect(hasPermission(managerUser, "edit", "product")).toBe(true);
      expect(hasPermission(managerUser, "delete", "product")).toBe(false);
    });

    it("should grant viewer only view permission", () => {
      expect(hasPermission(viewerUser, "view", "product")).toBe(true);
      expect(hasPermission(viewerUser, "create", "product")).toBe(false);
      expect(hasPermission(viewerUser, "edit", "product")).toBe(false);
      expect(hasPermission(viewerUser, "delete", "product")).toBe(false);
    });
  });

  describe("convenience functions", () => {
    it("canView should work correctly", () => {
      expect(canView(adminUser, "product")).toBe(true);
      expect(canView(managerUser, "product")).toBe(true);
      expect(canView(viewerUser, "product")).toBe(true);
    });

    it("canCreate should work correctly", () => {
      expect(canCreate(adminUser, "product")).toBe(true);
      expect(canCreate(managerUser, "product")).toBe(true);
      expect(canCreate(viewerUser, "product")).toBe(false);
    });

    it("canEdit should work correctly", () => {
      expect(canEdit(adminUser, "product")).toBe(true);
      expect(canEdit(managerUser, "product")).toBe(true);
      expect(canEdit(viewerUser, "product")).toBe(false);
    });

    it("canDelete should work correctly", () => {
      expect(canDelete(adminUser, "product")).toBe(true);
      expect(canDelete(managerUser, "product")).toBe(false);
      expect(canDelete(viewerUser, "product")).toBe(false);
    });
  });

  describe("role checks", () => {
    it("isAdmin should identify admins", () => {
      expect(isAdmin(adminUser)).toBe(true);
      expect(isAdmin(managerUser)).toBe(false);
      expect(isAdmin(viewerUser)).toBe(false);
    });

    it("isManagerOrAdmin should identify managers and admins", () => {
      expect(isManagerOrAdmin(adminUser)).toBe(true);
      expect(isManagerOrAdmin(managerUser)).toBe(true);
      expect(isManagerOrAdmin(viewerUser)).toBe(false);
    });
  });

  describe("getUserPermissions", () => {
    it("should return correct permissions for each role", () => {
      const adminPerms = getUserPermissions(adminUser, "product");
      expect(adminPerms).toContain("view");
      expect(adminPerms).toContain("create");
      expect(adminPerms).toContain("edit");
      expect(adminPerms).toContain("delete");

      const managerPerms = getUserPermissions(managerUser, "product");
      expect(managerPerms).toContain("view");
      expect(managerPerms).toContain("create");
      expect(managerPerms).toContain("edit");
      expect(managerPerms).not.toContain("delete");

      const viewerPerms = getUserPermissions(viewerUser, "product");
      expect(viewerPerms).toContain("view");
      expect(viewerPerms).not.toContain("create");
    });
  });

  describe("getAccessibleResources", () => {
    it("should return all resources for admin", () => {
      const resources = getAccessibleResources(adminUser);
      expect(resources).toContain("product");
      expect(resources).toContain("supplier");
      expect(resources).toContain("category");
      expect(resources).toContain("user");
      expect(resources).toContain("report");
    });

    it("should return limited resources for viewer", () => {
      const resources = getAccessibleResources(viewerUser);
      expect(resources).toContain("product");
      expect(resources).toContain("supplier");
      expect(resources).toContain("category");
      expect(resources).toContain("report");
      expect(resources).not.toContain("user");
    });
  });

  describe("permission enforcement", () => {
    it("requirePermission should throw for unauthorized users", () => {
      expect(() => {
        requirePermission(viewerUser, "create", "product");
      }).toThrow(PermissionError);
    });

    it("requirePermission should not throw for authorized users", () => {
      expect(() => {
        requirePermission(managerUser, "create", "product");
      }).not.toThrow();
    });

    it("requireAdmin should throw for non-admins", () => {
      expect(() => {
        requireAdmin(managerUser);
      }).toThrow(PermissionError);

      expect(() => {
        requireAdmin(viewerUser);
      }).toThrow(PermissionError);
    });

    it("requireAdmin should not throw for admins", () => {
      expect(() => {
        requireAdmin(adminUser);
      }).not.toThrow();
    });

    it("requireManagerOrAdmin should work correctly", () => {
      expect(() => {
        requireManagerOrAdmin(adminUser);
      }).not.toThrow();

      expect(() => {
        requireManagerOrAdmin(managerUser);
      }).not.toThrow();

      expect(() => {
        requireManagerOrAdmin(viewerUser);
      }).toThrow(PermissionError);
    });
  });
});
