import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Content } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContent: (content: Content) => void;
}

export function HistoryPanel({ isOpen, onClose, onSelectContent }: HistoryPanelProps) {
  const { data: historyItems, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents/recent"],
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case "expand":
        return "bg-primary-100 text-primary-800";
      case "summarize":
        return "bg-green-100 text-green-800";
      case "similar":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatContentType = (contentType: string) => {
    return contentType.charAt(0).toUpperCase() + contentType.slice(1);
  };

  const formatTimeAgo = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Unknown time";
    }
  };

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-lg border-l border-gray-200 z-20 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">History</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="text-gray-400 hover:text-gray-500 h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full mt-3" />
                <Skeleton className="h-3 w-3/4 mt-1" />
              </div>
            ))
          ) : historyItems && historyItems.length > 0 ? (
            historyItems.map((item) => (
              <div 
                key={item.id} 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectContent(item)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className={`${getContentTypeColor(item.contentType)} font-medium`}>
                      {formatContentType(item.contentType)}
                    </Badge>
                    <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {item.transformedContent.slice(0, 150)}...
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No history items found</p>
              <p className="text-sm mt-1">Use the tools to generate content</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
