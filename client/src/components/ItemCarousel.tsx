import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ItemWithOwner } from "@shared/schema";
import ItemCard from "./ItemCard";

interface ItemCarouselProps {
  items: ItemWithOwner[];
  title: string;
  subtitle?: string;
}

export default function ItemCarousel({ items, title, subtitle }: ItemCarouselProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        
        <Carousel className="w-full">
          <CarouselContent className="-ml-1">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ItemCard item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
