import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { ProductDialog } from "@/components/ProductDialog";
import { toast } from "sonner";

/**
 * Products page with AG Grid for displaying and managing products.
 * Features filtering, sorting, editing, and CRUD operations.
 */
export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fetch products
  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({
    search: searchTerm || undefined,
  });

  // Mutations
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      setEditingProduct(null);
      setShowDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Product Name",
        flex: 2,
        filter: "agTextColumnFilter",
        sort: "asc",
      },
      {
        field: "sku",
        headerName: "SKU",
        flex: 1,
        filter: "agTextColumnFilter",
      },
      {
        field: "categoryId",
        headerName: "Category",
        flex: 1,
        valueFormatter: (params: any) => `Category ${params.value}`,
      },
      {
        field: "quantity",
        headerName: "Quantity",
        flex: 1,
        filter: "agNumberColumnFilter",
        cellStyle: (params: any) => {
          if (params.value <= params.data.minStockLevel) {
            return { backgroundColor: "#fef3c7", color: "#92400e" };
          }
          return null;
        },
      },
      {
        field: "unitPrice",
        headerName: "Unit Price",
        flex: 1,
        valueFormatter: (params: any) => `$${parseFloat(params.value).toFixed(2)}`,
      },
      {
        field: "minStockLevel",
        headerName: "Min Stock",
        flex: 1,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Actions",
        flex: 1,
        cellRenderer: (params: any) => (
          <div className="flex gap-2 h-full items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingProduct(params.data);
                setShowDialog(true);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure?")) {
                  deleteProduct.mutate({ id: params.data.id });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const handleCreateNew = useCallback(() => {
    setEditingProduct(null);
    setShowDialog(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setShowDialog(false);
    setEditingProduct(null);
  }, []);

  const handleSaveProduct = useCallback(
    (data: any) => {
      if (editingProduct) {
        updateProduct.mutate({
          id: editingProduct.id,
          ...data,
        });
      } else {
        refetch();
        handleDialogClose();
      }
    },
    [editingProduct, updateProduct, refetch, handleDialogClose]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-600 mt-1">Manage your product inventory</p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* AG Grid */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              {products?.length || 0} products in inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
              <AgGridReact
                rowData={products}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                loading={isLoading}
                domLayout="normal"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Dialog */}
        <ProductDialog
          open={showDialog}
          onOpenChange={handleDialogClose}
          product={editingProduct}
          onSave={handleSaveProduct}
          onSuccess={() => {
            refetch();
            handleDialogClose();
          }}
        />
      </div>
    </div>
  );
}
