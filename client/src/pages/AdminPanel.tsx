import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Check, X } from "lucide-react";
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
    queryFn: async () => {
      const res = await fetch("/api/admin/items/pending", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("👉 PENDING ITEMS:", data); // add this
      return data;
    },
  });


  const updateItemStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/admin/items/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items/pending"] });
      toast({
        title: "Item approved",
        description: "The item has been marked as approved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to approve items.",
          variant: "destructive",
        });
        setLocation("/");
        return;
      }
      toast({
        title: "Failed to approve item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproveItem = (id: number) => {
    updateItemStatusMutation.mutate({ id, status: "approved" });
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="gradient-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin - Pending Items
            </CardTitle>
            <p className="text-gray-600">Review and approve submitted items</p>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <p>Loading...</p>
            ) : pendingItems.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.images?.[0] || "/api/placeholder/100/100"}
                        alt={item.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.category} • {item.size} • {item.condition}
                        </p>
                        <p className="text-xs text-gray-400">
                          by {item.owner.firstName} {item.owner.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{item.points} pts</Badge>
                      <Button
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={() => handleApproveItem(item.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
