import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as permissionService from "../services/permissionService";

/**
 * Permission Router
 * Provides tRPC endpoints for checking and managing permissions.
 */

export const permissionRouter = router({
  /**
   * Get current user's role
   */
  getMyRole: protectedProcedure.query(({ ctx }) => {
    return {
      role: ctx.user.role,
      isAdmin: permissionService.isAdmin(ctx.user),
      isManager: ctx.user.role === "manager",
      isViewer: ctx.user.role === "viewer",
    };
  }),

  /**
   * Get accessible resources for current user
   */
  getAccessibleResources: protectedProcedure.query(({ ctx }) => {
    return {
      resources: permissionService.getAccessibleResources(ctx.user),
      permissions: {
        product: permissionService.getUserPermissions(ctx.user, "product"),
        supplier: permissionService.getUserPermissions(ctx.user, "supplier"),
        category: permissionService.getUserPermissions(ctx.user, "category"),
        report: permissionService.getUserPermissions(ctx.user, "report"),
      },
    };
  }),

  /**
   * Check if user can perform action
   */
  canPerform: protectedProcedure
    .input(
      z.object({
        action: z.enum(["view", "create", "edit", "delete"]),
        resource: z.enum(["product", "supplier", "category", "user", "report"]),
      })
    )
    .query(({ ctx, input }) => {
      return permissionService.hasPermission(ctx.user, input.action, input.resource);
    }),

  /**
   * Check if user is admin
   */
  isAdmin: protectedProcedure.query(({ ctx }) => {
    return permissionService.isAdmin(ctx.user);
  }),

  /**
   * Check if user is manager or admin
   */
  isManagerOrAdmin: protectedProcedure.query(({ ctx }) => {
    return permissionService.isManagerOrAdmin(ctx.user);
  }),
});
