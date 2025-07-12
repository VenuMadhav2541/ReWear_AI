// Updated Dashboard.tsx for handling swap and point requests
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Package,
  ArrowLeftRight,
  User,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  ItemWithOwner,
  SwapWithDetails,
  PointTransaction,
} from "@shared/schema";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define enriched type locally
export type SwapRequest = {
  id: number;
  createdAt: Date | null;
  type: string;
  status: string | null;
  ownerId: number;
  itemId: number;
  itemTitle: string;
  requesterId: number;
  requesterName: string;
  offeredItemId: number | null;
  offeredItemTitle?: string;
  offeredPoints: number | null;
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: userItems = [] } = useQuery<ItemWithOwner[]>({
    queryKey: ["/api/user/items"],
    enabled: isAuthenticated,
  });

  const { data: swaps = [] } = useQuery<SwapWithDetails[]>({
    queryKey: ["/api/swaps"],
    enabled: isAuthenticated,
  });

  const { data: pointTransactions = [] } = useQuery<PointTransaction[]>({
    queryKey: ["/api/points/transactions"],
    enabled: isAuthenticated,
  });

  const { data: swapRequests = [] } = useQuery<SwapRequest[]>({
    queryKey: ["/api/requests"],
    enabled: isAuthenticated,
  });

  const approveRequest = useMutation({
    mutationFn: (id: number) => fetch(`/api/requests/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swaps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points/transactions"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "swapped": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="gradient-card custom-shadow mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 mb-4">{user?.email}</p>
                <div className="flex items-center space-x-4">
                  <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full flex items-center">
                    <Coins className="w-4 h-4 mr-2" />
                    {user?.points} Points
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    {userItems.length} Items
                  </div>
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full flex items-center">
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    {swaps.length} Swaps
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/add-item">
                  <Button className="gradient-btn text-white">
                    <Package className="w-4 h-4 mr-2" />
                    List New Item
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="swaps">Swap History</TabsTrigger>
            <TabsTrigger value="points">Points History</TabsTrigger>
            <TabsTrigger value="requests">Swap/Point Requests</TabsTrigger>
          </TabsList>

          {/* My Items Tab */}
          <TabsContent value="items" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">My Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {userItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
                    <p className="text-gray-600 mb-4">Start by listing your first item!</p>
                    <Link href="/add-item">
                      <Button className="gradient-btn text-white">List Your First Item</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 bg-white rounded-lg border"
                      >
                        <img
                          src={item.images?.[0] || "/api/placeholder/100/100"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">
                            {item.category} • {item.size}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Coins className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-emerald-600 font-medium">
                              {item.points} points
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => alert("Edit")}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert("Delete")}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swaps Tab */}
          <TabsContent value="swaps" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Swap History</CardTitle>
              </CardHeader>
              <CardContent>
                {swaps.length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowLeftRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No swaps yet</h3>
                    <p className="text-gray-600 mb-4">Browse items to start swapping!</p>
                    <Link href="/browse">
                      <Button className="gradient-btn text-white">Browse Items</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {swaps.map((swap) => (
                      <div
                        key={swap.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={swap.item.images?.[0] || "/api/placeholder/100/100"}
                            alt={swap.item.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{swap.item.title}</h3>
                            <p className="text-sm text-gray-500">
                              {swap.swapType === "points"
                                ? "Points Redemption"
                                : "Direct Swap"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {swap.createdAt
                                ? new Date(swap.createdAt).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {swap.swapType === "points" && (
                            <div className="flex items-center text-emerald-600">
                              <Coins className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">{swap.pointsUsed}</span>
                            </div>
                          )}
                          <Badge className={getStatusColor(swap.status)}>
                            {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Points History</CardTitle>
              </CardHeader>
              <CardContent>
                {pointTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">
                      Start swapping to earn and spend points!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pointTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.amount > 0
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <Coins
                              className={`w-5 h-5 ${
                                transaction.amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {transaction.description}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {transaction.type}
                            </p>
                            <p className="text-xs text-gray-400">
                              {transaction.createdAt
                                ? new Date(transaction.createdAt).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="requests" className="space-y-4">
            <Card className="gradient-card custom-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Incoming Swap & Point Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {swapRequests.filter(req => req.ownerId === user?.id && req.status === "pending").length === 0 ? (
                  <div className="text-center py-4 text-gray-600">
                    No incoming requests.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {swapRequests
                      .filter(req => req.ownerId === user?.id && req.status === "pending")
                      .map((req) => (
                        <div key={req.id} className="flex justify-between items-center bg-white p-4 rounded-lg border">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {req.type === "swap"
                                ? `Swap Request: ${req.itemTitle} ↔ ${req.offeredItemTitle}`
                                : `Point Offer: ${req.itemTitle} for ${req.offeredPoints} pts`}
                            </h3>
                            <p className="text-sm text-gray-500">
                              From: {req.requesterName}
                            </p>
                          </div>
                          <Button
                            onClick={() => approveRequest.mutate(req.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
