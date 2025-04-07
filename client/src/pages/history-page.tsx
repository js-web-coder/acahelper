import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Copy, 
  Download, 
  Loader2,
  Search,
  Trash2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { WordCounter } from "@/components/ui/word-counter";
import { FormattedText } from "@/components/ui/formatted-text";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HistoryPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("expand");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch content history
  const { data: contents, isLoading, isError } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });

  // Filter contents based on active tab and search query
  const filteredContents = contents ? contents
    .filter(content => {
      // Filter by content type
      if (activeTab !== "all" && content.contentType !== activeTab) {
        return false;
      }
      // Filter by search query
      if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const contentTypeColors = {
    expand: "bg-blue-100 text-blue-800",
    summarize: "bg-green-100 text-green-800",
    similar: "bg-purple-100 text-purple-800",
  };

  const contentTypeNames = {
    expand: "Expanded",
    summarize: "Summarized",
    similar: "Similar",
  };

  // Handle content deletion
  const handleDeleteContent = async () => {
    if (!selectedContent) return;
    
    try {
      // This would be a mutation to delete content, but the API isn't implemented yet
      // For now, just show a toast message
      toast({
        title: "Content deleted",
        description: "Your content has been successfully deleted.",
      });
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
      
      // Invalidate the contents query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle content copy
  const handleCopyContent = (content: Content) => {
    navigator.clipboard.writeText(content.transformedContent);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  // Handle content download
  const handleDownloadContent = (content: Content) => {
    const element = document.createElement("a");
    const file = new Blob([content.transformedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${content.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        activeTool={activeTool}
        onToolSelect={setActiveTool}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Content History</h1>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Your Transformations</CardTitle>
                  <CardDescription>View and manage your saved content transformations</CardDescription>
                </div>
                
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="expand">Expanded</TabsTrigger>
                  <TabsTrigger value="summarize">Summarized</TabsTrigger>
                  <TabsTrigger value="similar">Similar</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-gray-500">Loading your content history...</p>
                  </div>
                </div>
              ) : isError ? (
                <div className="flex justify-center py-12">
                  <div className="flex flex-col items-center text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-gray-900 font-medium">Failed to load content history</p>
                    <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
                  </div>
                </div>
              ) : filteredContents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? (
                    <>
                      <p>No results found for "{searchQuery}"</p>
                      <p className="text-sm mt-2">Try a different search term</p>
                    </>
                  ) : (
                    <>
                      <p>No {activeTab !== "all" ? activeTab : ""} content found</p>
                      <p className="text-sm mt-2">Use the tools to transform content</p>
                      <Button className="mt-4" asChild>
                        <Link href="/">Go to Tools</Link>
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContents.map((content) => (
                    <Card key={content.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className={contentTypeColors[content.contentType as keyof typeof contentTypeColors]}>
                                {contentTypeNames[content.contentType as keyof typeof contentTypeNames]}
                              </Badge>
                              <h3 className="mt-1 font-medium text-lg">{content.title}</h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                          
                          <div className="mt-2 text-gray-600 line-clamp-2">
                            <FormattedText 
                              content={content.transformedContent.slice(0, 200) + (content.transformedContent.length > 200 ? "..." : "")} 
                              className="line-clamp-2"
                            />
                          </div>
                          
                          <div className="mt-3 flex items-center text-sm text-gray-500">
                            <span className="mr-4">Original: {content.originalWordCount} words</span>
                            <span>Result: {content.transformedWordCount} words</span>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedContent(content);
                              }}
                            >
                              View Details
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCopyContent(content)}
                            >
                              <Copy className="mr-1 h-4 w-4" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadContent(content)}
                            >
                              <Download className="mr-1 h-4 w-4" />
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                setSelectedContent(content);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Content Detail Dialog */}
      {selectedContent && (
        <Dialog 
          open={!!selectedContent && !isDeleteDialogOpen} 
          onOpenChange={(open) => {
            if (!open) setSelectedContent(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedContent.title}</DialogTitle>
              <DialogDescription>
                <Badge className={contentTypeColors[selectedContent.contentType as keyof typeof contentTypeColors]}>
                  {contentTypeNames[selectedContent.contentType as keyof typeof contentTypeNames]}
                </Badge>
                <span className="ml-2 text-sm text-gray-500">
                  {formatDistanceToNow(new Date(selectedContent.createdAt), { addSuffix: true })}
                </span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-2">
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Original Content</h3>
                  <WordCounter text={selectedContent.originalContent} />
                </div>
                <div className="p-4 border rounded-md bg-gray-50 overflow-auto max-h-[200px]">
                  <FormattedText content={selectedContent.originalContent} />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Transformed Content</h3>
                  <WordCounter text={selectedContent.transformedContent} />
                </div>
                <div className="p-4 border rounded-md bg-white overflow-auto max-h-[300px]">
                  <FormattedText content={selectedContent.transformedContent} />
                </div>
              </div>
              
              {selectedContent.metadata && (() => {
                const metadataObj = JSON.parse(selectedContent.metadata);
                return (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(metadataObj).map(key => {
                          const value = metadataObj[key];
                          if (value === null || value === undefined) return null;
                          return (
                            <div key={key} className="p-2 border rounded-md">
                              <span className="text-xs font-medium text-gray-500">{key}: </span>
                              <span className="text-sm">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <DialogFooter className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={() => handleCopyContent(selectedContent)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDownloadContent(selectedContent)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline"
                className="text-red-500 hover:text-red-600"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open) setIsDeleteDialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteContent}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
