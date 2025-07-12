import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, User, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ItemWithOwner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: item, isLoading, error } = useQuery<ItemWithOwner>({
    queryKey: ["/api/items", id],
    queryFn: async () => {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) throw new Error("Failed to fetch item");
      return response.json();
    },
    enabled: !!id,
  });

  const swapMutation = useMutation({
  mutationFn: (data: { itemId: number; swapType: "swap" | "points"; pointsUsed?: number }) => {
    const payload: any = {
      type: data.swapType,
      itemId: data.itemId,
    };

    if (data.swapType === "points") {
      payload.offeredPoints = data.pointsUsed;
    }

    // In the future: Add offeredItemId if implementing swap UI
    // else if (data.swapType === "swap") {
    //   payload.offeredItemId = selectedItemId;
    // }

    return apiRequest("POST", "/api/requests", payload);
  },
  onSuccess: () => {
    toast({
      title: "Request sent!",
      description: "The owner will be notified of your request.",
    });
  },
  onError: (error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to make a swap request.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Failed to send request",
      description: error.message,
      variant: "destructive",
    });
  },
});


  const handleSwapRequest = () => {
    if (!item || !isAuthenticated) return;
    swapMutation.mutate({ itemId: item.id, swapType: "swap" });
  };

  const handlePointsRedeem = () => {
    if (!item || !user) return;

    if (user.points < item.points) {
      toast({
        title: "Insufficient points",
        description: `You need ${item.points} points to redeem this item.`,
        variant: "destructive",
      });
      return;
    }

    swapMutation.mutate({
      itemId: item.id,
      swapType: "points",
      pointsUsed: item.points,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-full h-20 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
              <div className="h-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-40 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
          <Link href="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/browse">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="gradient-card overflow-hidden custom-shadow">
              <img
                src={item.images?.[0] || "/api/placeholder/400/400"}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            </Card>
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {item.images.slice(1).map((image, index) => (
                  <Card key={index} className="gradient-card overflow-hidden custom-shadow">
                    <img
                      src={image}
                      alt={`${item.title} ${index + 2}`}
                      className="w-full h-20 object-cover"
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <Card className="gradient-card custom-shadow">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
                <p className="text-gray-600 mb-6">{item.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="font-medium capitalize">{item.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <p className="font-medium capitalize">{item.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Size</span>
                    <p className="font-medium">{item.size}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Condition</span>
                    <p className="font-medium capitalize">{item.condition}</p>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mb-6">
                    <span className="text-sm text-gray-500">Tags</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-900">Points Required</span>
                  <div className="flex items-center text-emerald-600">
                    <Coins className="w-6 h-6 mr-2" />
                    <span className="text-2xl font-bold">{item.points}</span>
                  </div>
                </div>

                {isAuthenticated && user?.id !== item.ownerId && (
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSwapRequest}
                      disabled={swapMutation.isPending}
                      className="flex-1 gradient-btn text-white"
                    >
                      {swapMutation.isPending ? "Sending..." : "Request Swap"}
                    </Button>
                    <Button
                      onClick={handlePointsRedeem}
                      disabled={swapMutation.isPending || (user?.points || 0) < item.points}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {swapMutation.isPending ? "Redeeming..." : "Redeem via Points"}
                    </Button>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Please sign in to make a swap request</p>
                    <Link href="/login">
                      <Button className="gradient-btn text-white">Sign In</Button>
                    </Link>
                  </div>
                )}

                {user?.id === item.ownerId && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      This is your item
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card className="gradient-card custom-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Owner Information</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.owner.firstName} {item.owner.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Member since 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
