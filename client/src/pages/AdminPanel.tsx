import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Package, 
  ArrowLeftRight, 
  Check, 
  X, 
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { ItemWithOwner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function AdminPanel() {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, setLocation]);

  const { data: pendingItems = [], isLoading: itemsLoading } = useQuery<ItemWithOwner[]>({
    queryKey: ["/api/admin/items/pending"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    totalItems: number;
    totalSwaps: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/admin/items/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Item updated successfully",
        description: "The item status has been updated.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        setLocation("/");
        return;
      }
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Item deleted successfully",
        description: "The item has been removed from the system.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        setLocation("/");
        return;
      }
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproveItem = (id: number) => {
    updateItemStatusMutation.mutate({ id, status: "approved" });
  };

  const handleRejectItem = (id: number) => {
    updateItemStatusMutation.mutate({ id, status: "rejected" });
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      deleteItemMutation.mutate(id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="gradient-card custom-shadow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-emerald-600" />
              Admin Panel
            </CardTitle>
            <p className="text-gray-600">Manage items, users, and monitor platform activity</p>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="gradient-card custom-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card custom-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card custom-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Swaps</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <ArrowLeftRight className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Items ({pendingItems.length})</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Items */}
          <TabsContent value="pending" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Pending Item Reviews</CardTitle>
                <p className="text-gray-600">Review and approve/reject items submitted by users</p>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-20 bg-gray-200 rounded" />
                          <div className="h-8 w-20 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending items</h3>
                    <p className="text-gray-600">All items have been reviewed!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                        <img
                          src={item.images?.[0] || "/api/placeholder/100/100"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500 mb-1">
                            by {item.owner.firstName} {item.owner.lastName}
                          </p>
                          <p className="text-xs text-gray-400 mb-2">
                            {item.category} • {item.size} • {item.condition}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-emerald-600">
                            {item.points} points
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleApproveItem(item.id)}
                            disabled={updateItemStatusMutation.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectItem(item.id)}
                            disabled={updateItemStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deleteItemMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">User Management</CardTitle>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">User management features coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Platform Analytics</CardTitle>
                <p className="text-gray-600">Monitor platform performance and user engagement</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">Detailed analytics and reporting features coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
