import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * WebSocket Hook
 * Manages Socket.io connection and real-time notifications
 */

export interface Notification {
  type: string;
  title: string;
  message: string;
  productId?: number;
  supplierId?: number;
  severity?: "warning" | "critical";
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface ProductUpdate {
  productId: number;
  productName: string;
  quantity: number;
  action: "created" | "updated" | "deleted";
  timestamp: Date;
}

export interface StockMovement {
  productId: number;
  productName: string;
  movementType: string;
  quantity: number;
  reason?: string;
  timestamp: Date;
}

export function useWebSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected to server");
      setIsConnected(true);

      // Send user info to server
      newSocket.emit("user:join", {
        userId: user.id,
        role: user.role,
      });
    });

    newSocket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from server");
      setIsConnected(false);
    });

    // Notification events
    newSocket.on("notification:stock_low", (notification: Notification) => {
      console.log("[WebSocket] Received low stock alert:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on("notification:stock_critical", (notification: Notification) => {
      console.log("[WebSocket] Received critical stock alert:", notification);
      setNotifications((prev) => [notification, ...prev]);
      // Play sound for critical alerts
      playAlertSound();
    });

    newSocket.on("notification:private", (notification: Notification) => {
      console.log("[WebSocket] Received private notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    // Product update events
    newSocket.on("product:update", (update: ProductUpdate) => {
      console.log("[WebSocket] Received product update:", update);
      setProductUpdates((prev) => [update, ...prev]);
    });

    // Stock movement events
    newSocket.on("stock:movement", (movement: StockMovement) => {
      console.log("[WebSocket] Received stock movement:", movement);
      setStockMovements((prev) => [movement, ...prev]);
    });

    // Supplier update events
    newSocket.on("supplier:update", (update: any) => {
      console.log("[WebSocket] Received supplier update:", update);
    });

    // Admin alerts
    newSocket.on("alert:admin", (alert: any) => {
      console.log("[WebSocket] Received admin alert:", alert);
      if (user?.role === "admin") {
        setNotifications((prev) => [alert, ...prev]);
      }
    });

    // System messages
    newSocket.on("system:message", (data: any) => {
      console.log("[WebSocket] Received system message:", data);
    });

    // Error handling
    newSocket.on("error", (error: Error) => {
      console.error("[WebSocket] Error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  /**
   * Play alert sound for critical notifications
   */
  const playAlertSound = useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn("[WebSocket] Could not play alert sound:", error);
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Remove a specific notification
   */
  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Send a message through the socket
   */
  const emit = useCallback(
    (event: string, data: any) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    notifications,
    productUpdates,
    stockMovements,
    clearNotifications,
    removeNotification,
    emit,
  };
}
