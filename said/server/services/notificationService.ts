import { notificationRepository } from "../repositories/notificationRepository";
import { InsertNotification, Notification } from "../../drizzle/schema";

/**
 * Notification Service
 * Handles business logic for notifications.
 * Manages creation, retrieval, and marking of notifications.
 */

export const notificationService = {
  /**
   * Create a low stock notification for a product
   */
  async createLowStockNotification(
    userId: number,
    productId: number,
    productName: string,
    currentQuantity: number,
    minLevel: number
  ): Promise<Notification> {
    return notificationRepository.create({
      userId,
      type: "stock_low",
      title: `Low Stock: ${productName}`,
      message: `Product "${productName}" has ${currentQuantity} units, below minimum level of ${minLevel}`,
      productId,
      read: "false",
    });
  },

  /**
   * Create a critical stock notification
   */
  async createCriticalStockNotification(
    userId: number,
    productId: number,
    productName: string
  ): Promise<Notification> {
    return notificationRepository.create({
      userId,
      type: "stock_critical",
      title: `Critical Stock: ${productName}`,
      message: `Product "${productName}" is out of stock or critically low!`,
      productId,
      read: "false",
    });
  },

  /**
   * Create a supplier alert notification
   */
  async createSupplierAlertNotification(
    userId: number,
    supplierId: number,
    supplierName: string,
    message: string
  ): Promise<Notification> {
    return notificationRepository.create({
      userId,
      type: "supplier_alert",
      title: `Supplier Alert: ${supplierName}`,
      message,
      supplierId,
      read: "false",
    });
  },

  /**
   * Create a system notification
   */
  async createSystemNotification(
    userId: number,
    title: string,
    message: string
  ): Promise<Notification> {
    return notificationRepository.create({
      userId,
      type: "system",
      title,
      message,
      read: "false",
    });
  },

  /**
   * Get unread notifications for user
   */
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return notificationRepository.getUnreadByUserId(userId);
  },

  /**
   * Get recent notifications for user
   */
  async getRecentNotifications(userId: number, count: number = 20): Promise<Notification[]> {
    return notificationRepository.getRecentByUserId(userId, count);
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    return notificationRepository.markAsRead(notificationId);
  },

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: number): Promise<void> {
    return notificationRepository.markAllAsRead(userId);
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    return notificationRepository.delete(notificationId);
  },

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return notificationRepository.getUnreadCount(userId);
  },

  /**
   * Notify all admins about critical event
   */
  async notifyAdminsAboutCriticalEvent(
    title: string,
    message: string,
    productId?: number
  ): Promise<void> {
    // In production, this would query all admin users
    // For now, it's a placeholder for the structure
    console.log(`[ADMIN ALERT] ${title}: ${message}`);
  },
};
