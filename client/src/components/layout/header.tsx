import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, ChevronDown, History, LayoutDashboard, LogOut, Menu, Settings, User } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Calculate user's initials
  const getUserInitials = () => {
    if (!user || !user.username) return "?";
    
    // If fullName exists, use the first letter of each part
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    }
    
    // Fallback to the first two letters of the username
    return user.username.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary flex items-center">
            <Brain className="mr-2 h-6 w-6" />
            Aca.Helpers
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:ml-8 md:flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/" 
                  ? "text-primary bg-primary-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Tools
            </Link>
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/dashboard" 
                  ? "text-primary bg-primary-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/history" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/history" 
                  ? "text-primary bg-primary-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              History
            </Link>
          </nav>
        </div>
        
        {/* User menu */}
        <div className="flex items-center">
          <span className="hidden md:block mr-4 text-sm text-gray-700">
            {user?.email}
          </span>
          
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={`/api/profile-image/${user?.id}`} 
                      alt={user?.profileImage || "User"}
                    />
                    <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history" className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                disabled={logoutMutation.isPending}
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
