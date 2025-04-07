import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingDots } from "@/components/ui/loading-dots";
import { BookOpen, Copy, FileText, Lightbulb, ListChecks, MessageSquare, Save } from "lucide-react";
import { WordCounter } from "@/components/ui/word-counter";

const templateSchema = z.object({
  title: z.string().min(2, "Title is required").max(100, "Title is too long"),
  templateType: z.string().min(1, "Please select a template type"),
  content: z.string().min(10, "Content should be at least 10 characters long"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const templateTypes = [
  { value: "lesson-plan", label: "Lesson Plan", icon: <BookOpen className="h-4 w-4" /> },
  { value: "study-guide", label: "Study Guide", icon: <FileText className="h-4 w-4" /> },
  { value: "quiz", label: "Quiz", icon: <ListChecks className="h-4 w-4" /> },
  { value: "discussion-prompt", label: "Discussion Prompt", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "activity", label: "Activity", icon: <Lightbulb className="h-4 w-4" /> },
];

const templateExamples = {
  "lesson-plan": 
`# Lesson Plan: [Subject]

## Learning Objectives
- 
- 
- 

## Materials Needed
- 
- 

## Introduction (10 minutes)
Brief overview of the topic and why it's important.

## Direct Instruction (20 minutes)
Main content delivery.

## Guided Practice (15 minutes)
Activities for students to practice with teacher guidance.

## Independent Practice (15 minutes)
Activities for students to practice independently.

## Assessment (10 minutes)
How student learning will be measured.

## Closure (5 minutes)
Summary and next steps.
`,
  "study-guide": 
`# Study Guide: [Topic]

## Key Concepts
- 
- 
- 

## Important Vocabulary
- **Term 1**: Definition
- **Term 2**: Definition
- **Term 3**: Definition

## Main Topics
### Topic 1
- Important points
- Examples

### Topic 2
- Important points
- Examples

## Practice Questions
1. Question one?
2. Question two?
3. Question three?

## Additional Resources
- 
- 
`,
  "quiz": 
`# Quiz: [Subject]

## Multiple Choice
1. Question one?
   a) Option 1
   b) Option 2
   c) Option 3
   d) Option 4

2. Question two?
   a) Option 1
   b) Option 2
   c) Option 3
   d) Option 4

## Short Answer
3. Question three?

4. Question four?

## Essay
5. Question five?
`,
  "discussion-prompt": 
`# Discussion Prompt: [Topic]

## Background
Brief overview of the topic or context for discussion.

## Main Question
Primary question for discussion.

## Supporting Questions
- 
- 
- 

## Resources to Consider
- 
- 

## Guidelines for Discussion
- 
- 
`,
  "activity": 
`# Activity: [Title]

## Learning Objectives
- 
- 

## Materials Needed
- 
- 

## Instructions
1. 
2. 
3. 

## Extensions/Modifications
- 
- 

## Assessment/Reflection
- 
- 
`
};

export function TemplatesTool() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [result, setResult] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("lesson-plan");
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: "",
      templateType: "lesson-plan",
      content: templateExamples["lesson-plan"],
    },
  });

  // Handle template type change
  const handleTemplateChange = (type: string) => {
    setSelectedTemplate(type);
    form.setValue("templateType", type);
    form.setValue("content", templateExamples[type as keyof typeof templateExamples]);
  };

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      const response = await apiRequest("POST", "/api/content", {
        title: data.title,
        contentType: "template",
        originalText: data.content,
        transformedText: data.content,
        metadata: { templateType: data.templateType }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TemplateFormValues) => {
    saveTemplateMutation.mutate(data);
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(form.getValues("content"));
    setIsCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Educational Templates
              </CardTitle>
              <CardDescription>
                Select from common educational formats to get started with your content creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title for your template" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="templateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Type</FormLabel>
                        <Select 
                          onValueChange={(value) => handleTemplateChange(value)} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templateTypes.map((type) => (
                              <SelectItem 
                                key={type.value} 
                                value={type.value}
                                className="flex items-center"
                              >
                                <div className="flex items-center">
                                  {type.icon}
                                  <span className="ml-2">{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the type of educational content template you need
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Content</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              className="min-h-[300px] font-mono text-sm resize-y"
                            />
                            <div className="absolute bottom-2 right-2">
                              <WordCounter text={field.value} />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Customize the template to fit your needs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={saveTemplateMutation.isPending}
                      className="flex-1"
                    >
                      {saveTemplateMutation.isPending ? (
                        <>
                          <LoadingDots className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Template
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCopy}
                      className="w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>
                See how your template looks with formatting applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 border rounded-md p-4 min-h-[300px] max-h-[500px] overflow-y-auto prose prose-sm dark:prose-invert">
                {form.getValues("content").split('\n').map((line, index) => {
                  // Handle markdown-like headers
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-xl font-bold mt-4 mb-2 text-primary">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-lg font-bold mt-3 mb-2 text-primary/90">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-md font-bold mt-2 mb-1 text-primary/80">{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return (
                      <div key={index} className="flex items-start ml-2 mb-1">
                        <div className="text-primary mr-2">•</div>
                        <div>{line.substring(2)}</div>
                      </div>
                    );
                  } else if (line.match(/^\d+\.\s/)) {
                    const num = line.substring(0, line.indexOf('.'));
                    return (
                      <div key={index} className="flex items-start ml-2 mb-1">
                        <div className="text-primary mr-2 font-medium min-w-[20px]">{num}.</div>
                        <div>{line.substring(line.indexOf(' ') + 1)}</div>
                      </div>
                    );
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index} className="font-bold mb-1">{line.substring(2, line.length - 2)}</p>;
                  } else if (line.includes('*') && !line.startsWith('*') && !line.endsWith('*')) {
                    // Handle inline italics
                    const parts = line.split(/(\*[^*]+\*)/g);
                    return (
                      <p key={index} className="mb-1">
                        {parts.map((part, i) => {
                          if (part.startsWith('*') && part.endsWith('*')) {
                            return <em key={i} className="italic">{part.substring(1, part.length - 1)}</em>;
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </p>
                    );
                  } else if (line.trim() === '') {
                    return <div key={index} className="h-2"></div>;
                  } else {
                    return <p key={index} className="mb-1">{line}</p>;
                  }
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}