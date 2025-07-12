import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { ItemWithOwner } from "@shared/schema";
import ItemCard from "@/components/ItemCard";
import { useToast } from "@/hooks/use-toast";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [condition, setCondition] = useState("all");
  const [naturalQuery, setNaturalQuery] = useState("");
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<ItemWithOwner[]>({
    queryKey: ["/api/items", { search, category, size, condition }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "all") params.append("category", category);
      if (size !== "all") params.append("size", size);
      if (condition !== "all") params.append("condition", condition);
      
      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      return response.json();
    },
  });

  const naturalSearchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch("/api/search/natural", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to process natural search");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const { filters } = data;
      
      // Apply the AI-parsed filters
      if (filters.category) setCategory(filters.category.toLowerCase());
      if (filters.size) setSize(filters.size);
      if (filters.condition) setCondition(filters.condition.toLowerCase());
      if (filters.search) setSearch(filters.search);
      
      toast({
        title: "Smart search applied!",
        description: "Your natural language query has been converted to filters.",
      });
    },
    onError: (error) => {
      console.error("Natural search error:", error);
      toast({
        title: "Search failed",
        description: "Using your query as regular search instead.",
        variant: "destructive",
      });
      // Fall back to regular search
      setSearch(naturalQuery);
    },
  });

  const handleNaturalSearch = () => {
    if (!naturalQuery.trim()) return;
    naturalSearchMutation.mutate(naturalQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
          <p className="text-gray-600">Discover amazing clothing items from our community</p>
        </div>

        {/* Search and Filter */}
        <Card className="gradient-card mb-8 custom-shadow">
          <CardContent className="p-6">
            {/* Natural Language Search */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Smart Search</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Try: 'Looking for casual summer dresses in size M' or 'Men's jackets in good condition'"
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleNaturalSearch()}
                />
                <Button
                  onClick={handleNaturalSearch}
                  disabled={naturalSearchMutation.isPending || !naturalQuery.trim()}
                  className="gradient-btn text-white"
                >
                  {naturalSearchMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                ✨ Describe what you're looking for in natural language, and AI will set the filters for you!
              </p>
            </div>

            {/* Regular Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>


                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setSize("");
                    setCondition("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="gradient-card custom-shadow">
                <div className="w-full h-48 bg-gray-200 animate-pulse rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
