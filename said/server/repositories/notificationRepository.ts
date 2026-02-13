import { eq, and, desc } from "drizzle-orm";
import { notifications, Notification, InsertNotification } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Notification Repository
 * Handles all database operations for notifications.
 */

export const notificationRepository = {
  /**
   * Get all unread notifications for a user
   */
  async getUnreadByUserId(userId: number): Promise<Notification[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, "false")))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  },

  /**
   * Get recent notifications for a user
   */
  async getRecentByUserId(userId: number, count: number = 20): Promise<Notification[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(count);
  },

  /**
   * Create a new notification
   */
  async create(data: InsertNotification): Promise<Notification> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(notifications).values(data);

    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, data.userId),
          eq(notifications.type, data.type),
          eq(notifications.title, data.title)
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(1);

    if (result.length === 0) throw new Error("Failed to create notification");
    return result[0];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(notifications)
      .set({ read: "true" })
      .where(eq(notifications.id, notificationId));
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(notifications)
      .set({ read: "true" })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, "false")));
  },

  /**
   * Delete a notification
   */
  async delete(notificationId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const notification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (notification.length === 0) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    await db.delete(notifications).where(eq(notifications.id, notificationId));
    return true;
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, "false")));

    return result.length;
  },
};
