import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Coins, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const NavigationItems = () => (
    <>
      <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
        Home
      </Link>
      <Link href="/browse" className="text-gray-700 hover:text-emerald-600 transition-colors">
        Browse Items
      </Link>
      {isAuthenticated && (
        <Link href="/add-item" className="text-gray-700 hover:text-emerald-600 transition-colors">
          List Item
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-emerald-600 text-2xl">♻️</div>
              <span className="text-xl font-bold text-gray-900">ReWear</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationItems />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span>{user?.firstName}</span>
                </Link>
                <div className="flex items-center space-x-1 bg-emerald-50 px-3 py-1 rounded-full">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">{user?.points}</span>
                </div>
                {user?.role === "admin" && (
                  <Link href="/admin" className="text-gray-700 hover:text-emerald-600 transition-colors">
                    Admin
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="gradient-btn text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <NavigationItems />
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors">
                        Dashboard
                      </Link>
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">{user?.points} Points</span>
                      </div>
                      {user?.role === "admin" && (
                        <Link href="/admin" className="text-gray-700 hover:text-emerald-600 transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-gray-700 hover:text-emerald-600 transition-colors">
                        Sign In
                      </Link>
                      <Link href="/register" className="text-gray-700 hover:text-emerald-600 transition-colors">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
