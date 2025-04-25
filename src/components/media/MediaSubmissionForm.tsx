
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const mediaFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.string().min(1, "Age is required"),
  category: z.enum(["Top Model", "Top Performer", "Top Dancer", "Fashion Designer"]),
  description: z.string().min(10, "Please provide a description").max(500, "Description must not exceed 500 characters"),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;
type TalentStatus = "pending" | "approved" | "rejected" | "on_hold";

interface MediaSubmissionFormProps {
  onSubmitSuccess: () => void;
}

const MediaSubmissionForm = ({ onSubmitSuccess }: MediaSubmissionFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      category: undefined,
    },
  });

  const onSubmit = async (data: MediaFormData) => {
    try {
      const submissionData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        age: parseInt(data.age, 10),
        category_type: data.category,
        notes: data.description,
        social_media: {
          instagram: data.instagramHandle || null,
          tiktok: data.tiktokHandle || null
        },
        status: "pending" as TalentStatus
      };
      
      console.log("Submitting entry:", submissionData);
      
      const { error } = await supabase
        .from('talent_applications')
        .insert(submissionData);
      
      if (error) {
        console.error("Database insertion error:", error);
        toast({
          title: "Submission Error",
          description: `Failed to save your submission: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success!",
        description: "Your entry has been submitted for review.",
      });
      
      form.reset();
      setIsSubmitted(true);
      onSubmitSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to process your submission",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gray-900 border border-emerge-gold rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-serif text-emerge-gold mb-6 text-center">
        Submit Your Entry
      </h2>

      {isSubmitted ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl text-white">Thank you for registering!</h3>
          <p className="text-gray-300">
            Our team will review your information and reach out to selected talent for the next stage.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            className="bg-emerge-gold hover:bg-yellow-500 text-black font-medium"
          >
            Submit Another Entry
          </Button>
        </div>
      ) : (
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
            </div>

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
            >
              Submit Entry
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MediaSubmissionForm;
