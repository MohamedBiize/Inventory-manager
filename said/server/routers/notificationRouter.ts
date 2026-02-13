import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { notificationService } from "../services/notificationService";

/**
 * Notification Router
 * Provides tRPC endpoints for managing notifications.
 */

export const notificationRouter = router({
  /**
   * Get unread notifications for current user
   */
  getUnread: protectedProcedure.query(({ ctx }) => {
    return notificationService.getUnreadNotifications(ctx.user.id);
  }),

  /**
   * Get recent notifications for current user
   */
  getRecent: protectedProcedure
    .input(
      z.object({
        count: z.number().min(1).max(100).default(20),
      })
    )
    .query(({ ctx, input }) => {
      return notificationService.getRecentNotifications(ctx.user.id, input.count);
    }),

  /**
   * Get unread count for current user
   */
  getUnreadCount: protectedProcedure.query(({ ctx }) => {
    return notificationService.getUnreadCount(ctx.user.id);
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(({ input }) => {
      return notificationService.markAsRead(input.notificationId);
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(({ ctx }) => {
    return notificationService.markAllAsRead(ctx.user.id);
  }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(({ input }) => {
      return notificationService.deleteNotification(input.notificationId);
    }),
});
