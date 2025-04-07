import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Save, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  theme: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Cookie consent popup state
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  
  // Check if cookie consent has been given
  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      // Only show after a short delay
      const timer = setTimeout(() => {
        setCookieDialogOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Prepare form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || "",
      username: user?.username || "",
      fullName: user?.fullName || "",
      theme: user?.theme || "light",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        username: user.username,
        fullName: user.fullName || "",
        theme: user.theme || "light",
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user, form]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Profile image upload mutation
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/profile/image", formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setProfileImage(data.imageUrl);
      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated",
      });
      setUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  // Handle profile image file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append("image", file);
    uploadProfileImageMutation.mutate(formData);
  };

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const fullName = user?.fullName || user?.username || "";
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Apply theme change immediately
  const handleThemeChange = (themeValue: string) => {
    form.setValue("theme", themeValue);
    setTheme(themeValue as "light" | "dark" | "system");
  };

  // Handle cookie consent
  const handleAcceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setCookieDialogOpen(false);
  };
  
  const handleDeclineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setCookieDialogOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {/* Cookie Consent Dialog */}
      <AlertDialog open={cookieDialogOpen} onOpenChange={setCookieDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cookie Policy</AlertDialogTitle>
            <AlertDialogDescription>
              We use cookies to enhance your experience on our website. Cookies help us remember your preferences, 
              analyze traffic, and provide personalized content. By clicking "Accept All", 
              you consent to the use of all cookies. You can also choose to decline non-essential cookies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeclineCookies}>
              Decline
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptCookies} className="bg-primary">
              Accept All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="container mx-auto py-10 px-4 md:px-6 flex-grow">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Image */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Image</CardTitle>
                <CardDescription>
                  Update your profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileImage || undefined} alt={user?.username} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Image
                </Button>
              </CardContent>
            </Card>

            {/* Account Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select 
                            onValueChange={(value) => handleThemeChange(value)} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : form.formState.isDirty ? (
                        <Save className="mr-2 h-4 w-4" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {form.formState.isDirty ? "Save Changes" : "Saved"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
