import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { ItemWithOwner } from "@shared/schema";
import { Link } from "wouter";

interface ItemCardProps {
  item: ItemWithOwner;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="gradient-card overflow-hidden custom-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative">
        <img
          src={item.images?.[0] || "/api/placeholder/400/300"}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Coins className="w-3 h-3 mr-1" />
          {item.points}
        </div>
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
          <Badge variant={item.status === "approved" ? "default" : "secondary"}>
            {item.status === "approved" ? "Available" : item.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>{item.category} • {item.size}</span>
          <span>{item.condition}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/items/${item.id}`} className="flex-1">
            <Button className="w-full gradient-btn text-white">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
