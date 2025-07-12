import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ItemWithOwner } from "@shared/schema";
import ItemCarousel from "@/components/ItemCarousel";
import { Recycle, Users, Zap } from "lucide-react";

export default function Landing() {
  const { data: items = [], isLoading } = useQuery<ItemWithOwner[]>({
    queryKey: ["/api/items"],
    select: (data) => data.slice(0, 8), // Show first 8 items
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sustainable Fashion<br />
              <span className="text-yellow-300">Starts Here</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Exchange unused clothes through direct swaps or our point-based system. 
              Reduce waste, refresh your wardrobe, and join our sustainable community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="gradient-btn px-8 py-4 text-lg">
                  Start Swapping
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-gray-900 btn-animate rounded-2xl">
                  Browse Items
                </Button>
              </Link>
              <Link href="/add-item">
                <Button size="lg" className="gradient-accent-btn px-8 py-4 text-lg">
                  List an Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {!isLoading && items.length > 0 && (
        <ItemCarousel
          items={items}
          title="Featured Items"
          subtitle="Discover amazing pieces from our community"
        />
      )}

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-r from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Shop by Category</h2>
            <p className="text-muted-modern">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "👗", title: "Women's", description: "Dresses, tops, accessories and more" },
              { icon: "👔", title: "Men's", description: "Shirts, pants, jackets and more" },
              { icon: "👶", title: "Kids", description: "Growing fast? Perfect for swapping!" },
            ].map((category) => (
              <Card key={category.title} className="landing-card card-hover">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-modern mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How ReWear Works</h2>
            <p className="text-gray-600">Three simple steps to sustainable fashion</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-emerald-600" />,
                title: "1. Join the Community",
                description: "Sign up and become part of our sustainable fashion community",
              },
              {
                icon: <Recycle className="w-8 h-8 text-emerald-600" />,
                title: "2. List Your Items",
                description: "Upload photos and details of clothes you no longer wear",
              },
              {
                icon: <Zap className="w-8 h-8 text-emerald-600" />,
                title: "3. Swap or Redeem",
                description: "Exchange items directly or use points to get what you want",
              },
            ].map((step) => (
              <Card key={step.title} className="gradient-card custom-shadow hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-gray-600">Together, we're making a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "5,000+", label: "Items Exchanged" },
              { number: "2,500+", label: "Active Users" },
              { number: "50 tons", label: "Textile Waste Prevented" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-emerald-400 text-2xl">♻️</div>
                <span className="text-xl font-bold">ReWear</span>
              </div>
              <p className="text-gray-400">Making sustainable fashion accessible to everyone.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/browse" className="hover:text-white">Browse Items</Link></li>
                <li><Link href="/add-item" className="hover:text-white">List an Item</Link></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Sustainability</a></li>
                <li><a href="#" className="hover:text-white">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ReWear. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
