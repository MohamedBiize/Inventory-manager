import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Bell, Lock, Download, Upload } from "lucide-react";

/**
 * Settings Page
 * Displays user permissions, notifications, and import/export options.
 */

export default function Settings() {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch user permissions
  const { data: permissionsData } = trpc.permissions.getAccessibleResources.useQuery();

  // Fetch unread notifications count
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();

  useEffect(() => {
    if (unreadCount) {
      setNotificationCount(unreadCount);
    }
  }, [unreadCount]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account and permissions</p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Account information and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <Badge className={`mt-2 ${getRoleBadgeColor(user?.role || "")}`}>
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unread Notifications</p>
              <Badge className="mt-2 bg-orange-100 text-orange-800">{notificationCount}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Your Permissions
          </CardTitle>
          <CardDescription>Actions you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {permissionsData?.permissions &&
              Object.entries(permissionsData.permissions).map(([resource, permissions]) => (
                <div key={resource} className="p-3 border rounded-lg">
                  <p className="font-medium capitalize mb-2">{resource}s</p>
                  <div className="space-y-1">
                    {permissions.length > 0 ? (
                      permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="mr-1">
                          {perm}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No permissions</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Real-time alerts about inventory changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You have <strong>{notificationCount} unread notifications</strong>
            </p>
            <p className="text-sm text-gray-600">
              Notifications are sent when:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
              <li>Product stock falls below minimum level</li>
              <li>Product stock reaches critical level</li>
              <li>Product is out of stock</li>
              <li>Supplier alerts are triggered</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Import & Export
          </CardTitle>
          <CardDescription>Manage your inventory data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">Import products or suppliers from CSV</p>
              <Button variant="outline" size="sm" disabled>
                Import Products
              </Button>
              <Button variant="outline" size="sm" className="ml-2" disabled>
                Import Suppliers
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">Export inventory data as CSV or PDF</p>
              <Button variant="outline" size="sm" disabled>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" className="ml-2" disabled>
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
