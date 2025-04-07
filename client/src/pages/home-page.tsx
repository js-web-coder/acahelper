import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ExpandTool } from "@/components/tools/expand-tool";
import { SummarizeTool } from "@/components/tools/summarize-tool";
import { SimilarTool } from "@/components/tools/similar-tool";
import { TemplatesTool } from "@/components/tools/templates-tool";
import { HistoryPanel } from "@/components/history/history-panel";
import { Content } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for tool switching
  const [activeTool, setActiveTool] = useState<string>("expand");
  
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for history panel
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Handle content selection from history
  const handleContentSelect = (content: Content) => {
    // Switch to the appropriate tool based on content type
    setActiveTool(content.contentType);
    
    // Close history panel
    setIsHistoryOpen(false);
    
    // Show notification
    toast({
      title: "Content loaded",
      description: `Loaded "${content.title}" for editing`,
    });
  };
  
  return (
    <div className="h-screen flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTool={activeTool} onToolSelect={setActiveTool} />
        
        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          activeTool={activeTool}
          onToolSelect={setActiveTool}
        />
        
        {/* Tool Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Mobile Toolbar */}
          <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsMobileMenuOpen(true)}
              size="sm"
            >
              Menu
            </Button>
            
            <div>
              <Select value={activeTool} onValueChange={setActiveTool}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expand">Expand Content</SelectItem>
                  <SelectItem value="summarize">Summarize Content</SelectItem>
                  <SelectItem value="similar">Generate Similar</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <History className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Tool Container */}
          <div className="flex-1 overflow-auto p-4 md:p-6 relative">
            {/* Show appropriate tool based on active selection */}
            {activeTool === "expand" && <ExpandTool />}
            {activeTool === "summarize" && <SummarizeTool />}
            {activeTool === "similar" && <SimilarTool />}
            {activeTool === "template" && <TemplatesTool />}
            
            {/* History Panel */}
            <HistoryPanel 
              isOpen={isHistoryOpen} 
              onClose={() => setIsHistoryOpen(false)}
              onSelectContent={handleContentSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
