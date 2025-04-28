
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const mediaFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.string().min(1, "Age is required"),
  gender: z.enum(["Male", "Female", "Non-Binary", "Prefer not to say"]),
  category: z.enum(["Top Model", "Top Performer", "Top Dancer", "Fashion Designer"]),
  description: z.string().min(10, "Please provide a description").max(500, "Description must not exceed 500 characters"),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;
type TalentStatus = "pending" | "approved" | "rejected" | "on_hold";

const MediaSubmission = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      category: undefined,
      gender: undefined,
    },
  });

  const onSubmit = async (data: MediaFormData) => {
    try {
      setIsSubmitting(true);
      
      // This data will be automatically synced to talent_applications by the database trigger
      const emergeData = {
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber,
        age: parseInt(data.age, 10),
        gender: data.gender,
        category: data.category,
        talent_description: data.description,
        instagram: data.instagramHandle || null,
        tiktok: data.tiktokHandle || null,
        telegram: null
      };
      
      // Insert into emerge_submissions - the trigger will handle syncing to talent_applications
      const { error } = await supabase
        .from('emerge_submissions')
        .insert(emergeData);
      
      if (error) {
        console.error("Database insertion error:", error);
        throw new Error(`Failed to save your submission: ${error.message}`);
      }
      
      toast({
        title: "Success!",
        description: "Your entry has been submitted for review.",
      });
      
      form.reset();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to process your submission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[40vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070&h=1000')"
          }}
        />
        <div className="emerge-container relative z-20 text-center py-16">
          <h1 className="text-3xl md:text-5xl font-serif mb-4">
            Submit Your Emerge Entry
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            This is your moment. Share your talent to be considered for global visibility 
            through the Emerge International platform.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <section className="py-16 bg-black text-white">
        <div className="emerge-container max-w-3xl">
          {isSubmitted ? (
            <div className="text-center p-8 border border-emerge-gold rounded-lg">
              <h2 className="text-2xl font-serif text-emerge-gold mb-4">
                Thank You for Your Submission!
              </h2>
              <p className="text-gray-300 mb-6">
                Your entry has been successfully submitted for review. Our team will evaluate your submission and contact you if selected.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2 bg-emerge-gold text-black font-medium rounded hover:bg-yellow-500 transition-colors"
              >
                Submit Another Entry
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 border border-emerge-gold rounded-lg p-6 md:p-8">
              <h2 className="text-2xl font-serif text-emerge-gold mb-6 text-center">
                Submit Your Entry
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} className="bg-gray-800 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} className="bg-gray-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1234567890" {...field} className="bg-gray-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Age</FormLabel>
                          <FormControl>
                            <Input placeholder="Your age" {...field} className="bg-gray-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Select Your Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="Top Model">Top Model</SelectItem>
                            <SelectItem value="Top Performer">Top Performer</SelectItem>
                            <SelectItem value="Top Dancer">Top Dancer</SelectItem>
                            <SelectItem value="Fashion Designer">Fashion Designer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Talent Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself and your experience (max 500 characters)" 
                            {...field} 
                            className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="instagramHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Instagram Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="@yourusername" {...field} className="bg-gray-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tiktokHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">TikTok Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="@yourtiktok" {...field} className="bg-gray-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerge-gold hover:bg-yellow-500 text-black font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Entry"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>
      
      <Toaster />
    </MainLayout>
  );
};

export default MediaSubmission;
