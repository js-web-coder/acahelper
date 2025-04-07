import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Sparkle, 
  CopyCheck, 
  History, 
  User, 
  LogOut, 
  X, 
  LayoutDashboard,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: string;
  onToolSelect: (tool: string) => void;
}

export function MobileMenu({ isOpen, onClose, activeTool, onToolSelect }: MobileMenuProps) {
  const { logoutMutation } = useAuth();

  const handleToolSelect = (tool: string) => {
    onToolSelect(tool);
    onClose();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu panel */}
      <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-white">
        <div className="w-full flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <span className="text-xl font-bold text-primary">Aca.Helpers</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 text-sm font-medium ${
                activeTool === "expand" 
                  ? "bg-primary-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => handleToolSelect("expand")}
            >
              <FileText className="mr-3 h-5 w-5" />
              <span>Expand Content</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 text-sm font-medium ${
                activeTool === "summarize" 
                  ? "bg-primary-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => handleToolSelect("summarize")}
            >
              <Sparkle className="mr-3 h-5 w-5" />
              <span>Summarize Content</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 text-sm font-medium ${
                activeTool === "similar" 
                  ? "bg-primary-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => handleToolSelect("similar")}
            >
              <CopyCheck className="mr-3 h-5 w-5" />
              <span>Generate Similar</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 text-sm font-medium ${
                activeTool === "template" 
                  ? "bg-primary-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => handleToolSelect("template")}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              <span>Templates</span>
            </Button>
            
            <div className="border-t border-gray-200 my-4" />
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              asChild
            >
              <Link href="/dashboard" onClick={onClose}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              asChild
            >
              <Link href="/history" onClick={onClose}>
                <History className="mr-3 h-5 w-5" />
                <span>History</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              asChild
            >
              <Link href="/settings" onClick={onClose}>
                <User className="mr-3 h-5 w-5" />
                <span>Profile Settings</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>{logoutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
