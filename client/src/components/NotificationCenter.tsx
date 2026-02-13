import { useEffect, useState } from "react";
import { Bell, X, AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebSocket, type Notification } from "@/hooks/useWebSocket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * NotificationCenter Component
 * Displays real-time notifications from WebSocket
 */

export default function NotificationCenter() {
  const { notifications, isConnected, removeNotification, clearNotifications } = useWebSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "stock_critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "stock_low":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "admin_alert":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "product_update":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "stock_critical":
        return "bg-red-50 border-red-200";
      case "stock_low":
        return "bg-orange-50 border-orange-200";
      case "admin_alert":
        return "bg-red-50 border-red-200";
      case "product_update":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600">CRITICAL</Badge>;
      case "warning":
        return <Badge className="bg-orange-600">WARNING</Badge>;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={`${unreadCount} unread notifications`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {!isConnected && (
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded-full" />
          )}
          {isConnected && (
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
              </span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification: Notification, index: number) => (
              <div
                key={index}
                className={`p-4 border-l-4 ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        {getSeverityBadge(notification.severity)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(index)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
