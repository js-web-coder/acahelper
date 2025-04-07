import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Sparkle, CopyCheck, BookOpen } from "lucide-react";

interface SidebarProps {
  activeTool: string;
  onToolSelect: (tool: string) => void;
}

export function Sidebar({ activeTool, onToolSelect }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <aside className="hidden md:flex md:flex-shrink-0 bg-white border-r border-gray-200">
      <div className="w-64 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">AI Tools</h2>
          <p className="text-sm text-gray-600">Transform your content</p>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Button
            variant={activeTool === "expand" ? "secondary" : "ghost"}
            className={`w-full justify-start px-4 py-3 text-sm font-medium ${
              activeTool === "expand" 
                ? "bg-primary-50 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => onToolSelect("expand")}
          >
            <FileText className="mr-3 h-5 w-5" />
            <span>Expand Content</span>
          </Button>
          
          <Button
            variant={activeTool === "summarize" ? "secondary" : "ghost"}
            className={`w-full justify-start px-4 py-3 text-sm font-medium ${
              activeTool === "summarize" 
                ? "bg-primary-50 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => onToolSelect("summarize")}
          >
            <Sparkle className="mr-3 h-5 w-5" />
            <span>Summarize Content</span>
          </Button>
          
          <Button
            variant={activeTool === "similar" ? "secondary" : "ghost"}
            className={`w-full justify-start px-4 py-3 text-sm font-medium ${
              activeTool === "similar" 
                ? "bg-primary-50 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => onToolSelect("similar")}
          >
            <CopyCheck className="mr-3 h-5 w-5" />
            <span>Generate Similar</span>
          </Button>
          
          <Button
            variant={activeTool === "template" ? "secondary" : "ghost"}
            className={`w-full justify-start px-4 py-3 text-sm font-medium ${
              activeTool === "template" 
                ? "bg-primary-50 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => onToolSelect("template")}
          >
            <BookOpen className="mr-3 h-5 w-5" />
            <span>Templates</span>
          </Button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900">Pro Tip</h3>
            <p className="mt-1 text-xs text-gray-600">
              Use "Expand Content" to elaborate on key points in your lesson plans.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
