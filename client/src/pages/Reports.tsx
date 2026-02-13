import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reports page with inventory visualizations and analytics.
 * Displays charts for stock value, product distribution, and trends.
 */
export default function Reports() {
  const { data: stats, isLoading: statsLoading } = trpc.products.stats.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();

  // Prepare data for category distribution chart
  const categoryDistribution = categories?.map((cat) => ({
    name: cat.name,
    count: products?.filter((p) => p.categoryId === cat.id).length || 0,
    value: products
      ?.filter((p) => p.categoryId === cat.id)
      .reduce((sum, p) => sum + (typeof p.unitPrice === "string" ? parseFloat(p.unitPrice) : p.unitPrice) * p.quantity, 0) || 0,
  })) || [];

  // Prepare data for price distribution
  const priceRanges = [
    { range: "$0-50", count: products?.filter((p) => parseFloat(p.unitPrice) <= 50).length || 0 },
    { range: "$50-100", count: products?.filter((p) => parseFloat(p.unitPrice) > 50 && parseFloat(p.unitPrice) <= 100).length || 0 },
    { range: "$100-500", count: products?.filter((p) => parseFloat(p.unitPrice) > 100 && parseFloat(p.unitPrice) <= 500).length || 0 },
    { range: "$500+", count: products?.filter((p) => parseFloat(p.unitPrice) > 500).length || 0 },
  ];

  // Prepare data for stock levels
  const stockLevels = [
    { level: "In Stock", count: products?.filter((p) => p.quantity > p.minStockLevel).length || 0 },
    { level: "Low Stock", count: products?.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0).length || 0 },
    { level: "Out of Stock", count: products?.filter((p) => p.quantity === 0).length || 0 },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Inventory insights and visualizations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">{stats?.totalProducts}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  ${(stats?.totalValue || 0).toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  ${(stats?.averagePrice || 0).toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>Distribution of products across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Stock Level Distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Stock Level Distribution</CardTitle>
              <CardDescription>Products by stock status</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockLevels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stockLevels.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Price Range Distribution */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle>Price Range Distribution</CardTitle>
              <CardDescription>Products grouped by price ranges</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Value Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Inventory Value by Category</CardTitle>
            <CardDescription>Total value of stock in each category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
