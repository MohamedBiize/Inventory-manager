import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { SupplierDialog } from "@/components/SupplierDialog";
import { toast } from "sonner";

/**
 * Suppliers page with AG Grid for managing supplier information.
 * Displays contact details, location, and CRUD operations.
 */
export default function Suppliers() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  // Fetch suppliers
  const { data: suppliers, isLoading, refetch } = trpc.suppliers.list.useQuery();

  // Mutations
  const deleteSupplier = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete supplier");
    },
  });

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Supplier Name",
        flex: 2,
        filter: "agTextColumnFilter",
        sort: "asc",
      },
      {
        field: "email",
        headerName: "Email",
        flex: 2,
        filter: "agTextColumnFilter",
      },
      {
        field: "phone",
        headerName: "Phone",
        flex: 1,
        filter: "agTextColumnFilter",
      },
      {
        field: "city",
        headerName: "City",
        flex: 1,
        filter: "agTextColumnFilter",
      },
      {
        field: "country",
        headerName: "Country",
        flex: 1,
        filter: "agTextColumnFilter",
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
                setEditingSupplier(params.data);
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
                  deleteSupplier.mutate({ id: params.data.id });
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
    setEditingSupplier(null);
    setShowDialog(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setShowDialog(false);
    setEditingSupplier(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Suppliers</h1>
            <p className="text-slate-600 mt-1">Manage your supplier network</p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {/* AG Grid */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Supplier List</CardTitle>
            <CardDescription>
              {suppliers?.length || 0} suppliers registered
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
              <AgGridReact
                rowData={suppliers}
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

        {/* Supplier Dialog */}
        <SupplierDialog
          open={showDialog}
          onOpenChange={handleDialogClose}
          supplier={editingSupplier}
          onSuccess={() => {
            refetch();
            handleDialogClose();
          }}
        />
      </div>
    </div>
  );
}
