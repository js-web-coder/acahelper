import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingDots } from "@/components/ui/loading-dots";
import { WordCounter } from "@/components/ui/word-counter";
import { Card } from "@/components/ui/card";
import { AIParametersDialog } from "@/components/tools/ai-parameters";
import { AIParameters } from "@shared/schema";
import { 
  FileText, 
  Trash2, 
  Save, 
  Copy, 
  Download, 
  Loader2 
} from "lucide-react";

export function ExpandTool() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [title, setTitle] = useState("");
  const [aiParameters, setAIParameters] = useState<AIParameters>({
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  });

  // Generate title from text
  const generateTitle = (text: string) => {
    const words = text.split(/\s+/);
    return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
  };

  // Transform content mutation
  const expandMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim()) {
        throw new Error("Please enter some content to expand");
      }
      
      const res = await apiRequest("POST", "/api/transform", {
        text,
        contentType: "expand",
        aiParameters,
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      setOutputText(data.transformedContent);
      // Generate title from input if not set
      if (!title) {
        setTitle(generateTitle(inputText));
      }
      
      toast({
        title: "Content expanded successfully",
        description: `Expanded from ${data.originalWordCount} to ${data.transformedWordCount} words`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Expansion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save content mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!outputText.trim()) {
        throw new Error("No content to save");
      }
      
      const contentTitle = title || generateTitle(inputText);
      
      const res = await apiRequest("POST", "/api/contents", {
        userId: user!.id,
        title: contentTitle,
        originalContent: inputText,
        transformedContent: outputText,
        contentType: "expand",
        originalWordCount: countWords(inputText),
        transformedWordCount: countWords(outputText),
        metadata: JSON.stringify({ 
          aiParameters,
          tone: "",
          audience: "" 
        }),
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Content saved",
        description: "Your expanded content has been saved to history",
      });
      
      // Invalidate contents cache to refresh history
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contents/recent"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setTitle("");
  };
  
  const handleAIParametersChange = (newParams: AIParameters) => {
    setAIParameters(newParams);
    toast({
      title: "AI Parameters Updated",
      description: "Generation parameters have been customized",
    });
  };
  
  const handleAIParametersReset = () => {
    setAIParameters({
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    });
    toast({
      title: "AI Parameters Reset",
      description: "Generation parameters have been reset to defaults",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied to clipboard",
      description: "The expanded content has been copied to your clipboard",
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([outputText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title || "expanded-content"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Count words helper
  const countWords = (text: string): number => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expand Content</h1>
        <p className="text-gray-600">Elaborate on your content to provide more detail and depth.</p>
      </div>

      <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Input Section */}
        <div className="flex-1 flex flex-col">
          <div className="mb-2 flex justify-between items-end">
            <label htmlFor="expand-input" className="block text-sm font-medium text-gray-700">Original Content</label>
            <div className="flex items-center gap-3">
              <AIParametersDialog
                parameters={aiParameters}
                onChange={handleAIParametersChange}
                onReset={handleAIParametersReset}
              />
              <WordCounter text={inputText} />
            </div>
          </div>
          
          <Textarea 
            id="expand-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-4 resize-none"
            placeholder="Enter your educational content to expand..."
          />
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={() => expandMutation.mutate(inputText)}
              disabled={expandMutation.isPending || !inputText.trim()}
              className="gap-2"
            >
              {expandMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Expanding...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Expand Content</span>
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClear}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex-1 flex flex-col">
          <div className="mb-2 flex justify-between items-end">
            <label htmlFor="expand-output" className="block text-sm font-medium text-gray-700">Expanded Content</label>
            <WordCounter text={outputText} />
          </div>
          
          <Card className="relative flex-1 p-0 overflow-hidden">
            {/* Loading State */}
            {expandMutation.isPending && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 font-medium rounded-md text-primary-700 bg-primary-50">
                    <Loader2 className="animate-spin h-5 w-5 text-primary mr-3" />
                    <LoadingDots text="Gemini AI is expanding your content" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Output Content */}
            <div 
              id="expand-output"
              className="h-full p-4 font-serif overflow-auto"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {outputText ? (
                outputText
              ) : (
                <p className="text-gray-400 italic">Your expanded content will appear here...</p>
              )}
            </div>
          </Card>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !outputText.trim()}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Result</span>
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!outputText.trim()}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!outputText.trim()}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
