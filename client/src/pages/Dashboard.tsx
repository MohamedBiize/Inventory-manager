import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Package, TrendingUp, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * Dashboard page displaying key inventory statistics.
 * Shows total products, stock value, low stock alerts, and quick actions.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.products.stats.useQuery();
  const { data: lowStockProducts, isLoading: lowStockLoading } = trpc.products.lowStock.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-slate-600">Manage your inventory efficiently</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.totalProducts || 0}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Active products in inventory</p>
            </CardContent>
          </Card>

          {/* Inventory Value Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">
                  ${(stats?.totalValue || 0).toFixed(2)}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Total inventory value</p>
            </CardContent>
          </Card>

          {/* Low Stock Alert Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">
                  {lowStockProducts?.length || 0}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Products below minimum</p>
            </CardContent>
          </Card>

          {/* Average Price Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">
                  ${(stats?.averagePrice || 0).toFixed(2)}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Average product price</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-md lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/products">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/suppliers">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Suppliers
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="border-0 shadow-md lg:col-span-2 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products below minimum stock level</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : lowStockProducts && lowStockProducts.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-200"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">{product.quantity}</p>
                        <p className="text-xs text-slate-500">min: {product.minStockLevel}</p>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <Link href="/products?filter=lowStock">
                      <Button variant="link" className="w-full text-sm">
                        View all {lowStockProducts.length} low stock items
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  ✓ All products are above minimum stock level
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
