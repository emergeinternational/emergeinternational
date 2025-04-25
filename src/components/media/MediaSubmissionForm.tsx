
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
  category: z.enum(["Model", "Dancer", "Singer", "Actor", "Designer", "Other"]),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  telegramHandle: z.string().optional(),
  description: z.string().min(10, "Please provide a description").max(300, "Description must not exceed 300 characters"),
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
          tiktok: data.tiktokHandle || null,
          telegram: data.telegramHandle || null
        },
        status: "pending" as TalentStatus
      };
      
      const { error } = await supabase
        .from('talent_applications')
        .insert(submissionData);
      
      if (error) {
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
    <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-6 text-center">
        Talent Registration Form
      </h2>

      {isSubmitted ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl text-black font-bold">Thank you for registering!</h3>
          <p className="text-gray-700">
            Our team will review your information and reach out to selected talent for the next stage.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            className="bg-[#d4af37] hover:bg-[#b89b2d] text-white font-medium"
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
                  <FormLabel className="font-bold text-black">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                  <FormLabel className="font-bold text-black">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
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
                  <FormLabel className="font-bold text-black">Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Age</FormLabel>
                  <FormControl>
                    <Input placeholder="Your age" {...field} />
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
                  <FormLabel className="font-bold text-black">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Model">Model</SelectItem>
                      <SelectItem value="Dancer">Dancer</SelectItem>
                      <SelectItem value="Singer">Singer</SelectItem>
                      <SelectItem value="Actor">Actor</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagramHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourusername" {...field} />
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
                  <FormLabel className="font-bold text-black">TikTok Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourtiktok" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telegramHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Telegram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourtelegram" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Talent Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself (max 300 characters)" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#d4af37] hover:bg-[#b89b2d] text-white font-medium"
            >
              Submit Registration
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MediaSubmissionForm;
