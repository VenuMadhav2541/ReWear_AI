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
    <Card className="item-card">
      <div className="relative">
        <img
          src={item.images?.[0] || "/api/placeholder/400/300"}
          alt={item.title}
          className="w-full h-48 object-cover image-hover"
        />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#6C63FF] to-[#7F5AF0] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg">
          <Coins className="w-3 h-3 mr-1" />
          {item.points}
        </div>
        <div className="absolute top-4 left-4">
          <Badge className={`${item.status === "approved" ? "status-available" : "status-pending"} shadow-sm`}>
            {item.status === "approved" ? "Available" : item.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-bold text-lg text-modern mb-2">{item.title}</h3>
        <p className="text-muted-modern text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center text-sm text-muted-modern mb-4">
          <span className="font-medium">{item.category} • {item.size}</span>
          <span className="capitalize">{item.condition}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/items/${item.id}`} className="flex-1">
            <Button className="w-full gradient-btn">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
