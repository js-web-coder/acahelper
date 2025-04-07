import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema";
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
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { FileText, Sparkle, CopyCheck, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("expand");
  
  // Fetch content history
  const { data: contents, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/contents"],
  });
  
  // Process data for charts and stats
  const activityData = contents ? processActivityData(contents) : [];
  const stats = contents ? calculateStats(contents) : {
    total: 0,
    expand: 0,
    summarize: 0,
    similar: 0,
    avgWordCountOriginal: 0,
    avgWordCountTransformed: 0,
  };
  
  // Get recent items
  const recentItems = contents 
    ? [...contents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    : [];
  
  function processActivityData(data: Content[]) {
    const typeCounts = {
      expand: 0,
      summarize: 0,
      similar: 0,
    };
    
    data.forEach(item => {
      typeCounts[item.contentType as keyof typeof typeCounts] += 1;
    });
    
    return [
      { name: 'Expand', value: typeCounts.expand, fill: '#3B82F6' },
      { name: 'Summarize', value: typeCounts.summarize, fill: '#10B981' },
      { name: 'Similar', value: typeCounts.similar, fill: '#8B5CF6' },
    ];
  }
  
  function calculateStats(data: Content[]) {
    const typeCounts = {
      expand: 0,
      summarize: 0,
      similar: 0,
    };
    
    let totalOriginalWords = 0;
    let totalTransformedWords = 0;
    
    data.forEach(item => {
      typeCounts[item.contentType as keyof typeof typeCounts] += 1;
      totalOriginalWords += item.originalWordCount;
      totalTransformedWords += item.transformedWordCount;
    });
    
    return {
      total: data.length,
      expand: typeCounts.expand,
      summarize: typeCounts.summarize,
      similar: typeCounts.similar,
      avgWordCountOriginal: data.length ? Math.round(totalOriginalWords / data.length) : 0,
      avgWordCountTransformed: data.length ? Math.round(totalTransformedWords / data.length) : 0,
    };
  }
  
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
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-lg font-semibold">{stats.total}</div>
                <p className="text-sm text-gray-500">Total Transformations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 flex items-center">
                <div className="mr-2 p-2 bg-blue-100 rounded-full">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{stats.expand}</div>
                  <p className="text-sm text-gray-500">Content Expanded</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 flex items-center">
                <div className="mr-2 p-2 bg-green-100 rounded-full">
                  <Sparkle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{stats.summarize}</div>
                  <p className="text-sm text-gray-500">Content Summarized</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 flex items-center">
                <div className="mr-2 p-2 bg-purple-100 rounded-full">
                  <CopyCheck className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{stats.similar}</div>
                  <p className="text-sm text-gray-500">Similar Content</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Summary of your content transformations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Word Count Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Word Count Analysis</CardTitle>
                <CardDescription>Average word counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Original Content (Avg)</div>
                    <div className="text-2xl font-semibold">{stats.avgWordCountOriginal} words</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Transformed Content (Avg)</div>
                    <div className="text-2xl font-semibold">{stats.avgWordCountTransformed} words</div>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">Average Change</div>
                    <div className="flex items-center">
                      <div className="text-2xl font-semibold">
                        {stats.avgWordCountTransformed - stats.avgWordCountOriginal} words
                      </div>
                      <ArrowRight className="ml-2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500">
                      {stats.avgWordCountTransformed > stats.avgWordCountOriginal
                        ? "Average increase in word count"
                        : "Average decrease in word count"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent content transformations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : recentItems.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentItems.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={
                            item.contentType === "expand" ? "bg-blue-100 text-blue-800" :
                            item.contentType === "summarize" ? "bg-green-100 text-green-800" :
                            "bg-purple-100 text-purple-800"
                          }>
                            {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                          </Badge>
                          <h3 className="mt-1 font-medium">{item.title}</h3>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {item.transformedContent.slice(0, 150)}...
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        {item.originalWordCount} words → {item.transformedWordCount} words
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity found</p>
                  <p className="text-sm mt-2">Start transforming content to see your activity here</p>
                  <Button className="mt-4" asChild>
                    <a href="/">Go to Tools</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
