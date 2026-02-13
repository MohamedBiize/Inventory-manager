import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { notificationService } from "./notificationService";

/**
 * WebSocket Service
 * Manages real-time communication with connected clients.
 * Handles notifications, stock alerts, and live updates.
 */

interface ConnectedUser {
  userId: number;
  socketId: string;
  role: string;
}

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  /**
   * Initialize Socket.io server
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupEventHandlers();
    return this.io;
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`);

      // User joins with their ID and role
      socket.on("user:join", (data: { userId: number; role: string }) => {
        this.connectedUsers.set(socket.id, {
          userId: data.userId,
          socketId: socket.id,
          role: data.role,
        });

        // Join a room for this user for private notifications
        socket.join(`user:${data.userId}`);
        console.log(`[WebSocket] User ${data.userId} joined room user:${data.userId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          this.connectedUsers.delete(socket.id);
          console.log(`[WebSocket] User disconnected: ${user.userId}`);
        }
      });

      // Handle errors
      socket.on("error", (error: Error) => {
        console.error(`[WebSocket] Error: ${error.message}`);
      });
    });
  }

  /**
   * Broadcast low stock alert to all connected users
   */
  async broadcastLowStockAlert(
    productId: number,
    productName: string,
    currentQuantity: number,
    minLevel: number
  ): Promise<void> {
    if (!this.io) return;

    const notification = {
      type: "stock_low",
      title: `Low Stock: ${productName}`,
      message: `Product "${productName}" has ${currentQuantity} units, below minimum level of ${minLevel}`,
      productId,
      timestamp: new Date(),
    };

    // Broadcast to all connected users
    this.io.emit("notification:stock_low", notification);
    console.log(`[WebSocket] Broadcasted low stock alert for product ${productId}`);
  }

  /**
   * Broadcast critical stock alert
   */
  async broadcastCriticalStockAlert(
    productId: number,
    productName: string
  ): Promise<void> {
    if (!this.io) return;

    const notification = {
      type: "stock_critical",
      title: `CRITICAL: ${productName} Out of Stock!`,
      message: `Product "${productName}" is out of stock or critically low!`,
      productId,
      timestamp: new Date(),
      severity: "critical",
    };

    // Broadcast to all connected users
    this.io.emit("notification:stock_critical", notification);
    console.log(`[WebSocket] Broadcasted critical stock alert for product ${productId}`);
  }

  /**
   * Send private notification to specific user
   */
  async sendPrivateNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (!this.io) return;

    const notification = {
      type,
      title,
      message,
      data,
      timestamp: new Date(),
    };

    // Send to user's private room
    this.io.to(`user:${userId}`).emit("notification:private", notification);
    console.log(`[WebSocket] Sent private notification to user ${userId}`);
  }

  /**
   * Broadcast product update to all users
   */
  async broadcastProductUpdate(
    productId: number,
    productName: string,
    quantity: number,
    action: "created" | "updated" | "deleted"
  ): Promise<void> {
    if (!this.io) return;

    const update = {
      productId,
      productName,
      quantity,
      action,
      timestamp: new Date(),
    };

    this.io.emit("product:update", update);
    console.log(`[WebSocket] Broadcasted product ${action} for product ${productId}`);
  }

  /**
   * Broadcast supplier update
   */
  async broadcastSupplierUpdate(
    supplierId: number,
    supplierName: string,
    action: "created" | "updated" | "deleted"
  ): Promise<void> {
    if (!this.io) return;

    const update = {
      supplierId,
      supplierName,
      action,
      timestamp: new Date(),
    };

    this.io.emit("supplier:update", update);
    console.log(`[WebSocket] Broadcasted supplier ${action} for supplier ${supplierId}`);
  }

  /**
   * Broadcast stock movement
   */
  async broadcastStockMovement(
    productId: number,
    productName: string,
    movementType: string,
    quantity: number,
    reason?: string
  ): Promise<void> {
    if (!this.io) return;

    const movement = {
      productId,
      productName,
      movementType,
      quantity,
      reason,
      timestamp: new Date(),
    };

    this.io.emit("stock:movement", movement);
    console.log(`[WebSocket] Broadcasted stock movement for product ${productId}`);
  }

  /**
   * Notify admins about critical event
   */
  async notifyAdminsAboutCriticalEvent(
    title: string,
    message: string,
    severity: "warning" | "critical" = "warning"
  ): Promise<void> {
    if (!this.io) return;

    const notification = {
      type: "admin_alert",
      title,
      message,
      severity,
      timestamp: new Date(),
    };

    // Send to all connected users (admins will filter on client side)
    this.io.emit("alert:admin", notification);
    console.log(`[WebSocket] Sent admin alert: ${title}`);
  }

  /**
   * Get count of connected users
   */
  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get list of connected users
   */
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: number): boolean {
    return Array.from(this.connectedUsers.values()).some((user) => user.userId === userId);
  }

  /**
   * Broadcast system message
   */
  async broadcastSystemMessage(message: string): Promise<void> {
    if (!this.io) return;

    this.io.emit("system:message", {
      message,
      timestamp: new Date(),
    });
    console.log(`[WebSocket] Broadcasted system message: ${message}`);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
