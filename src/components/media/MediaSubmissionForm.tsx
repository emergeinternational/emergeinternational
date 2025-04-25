
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { BasicInfoSection } from "../talent/FormSections/BasicInfoSection";
import { ModelMeasurementsSection } from "../talent/FormSections/ModelMeasurementsSection";
import { PerformerSection } from "../talent/FormSections/PerformerSection";
import { SocialSection } from "../talent/FormSections/SocialSection";

const mediaFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.string().min(1, "Age is required"),
  category: z.enum(["Top Model", "Top Performer", "Top Dancer", "Fashion Designer"]),
  description: z.string().min(10, "Please provide a description").max(500, "Description must not exceed 500 characters"),
  instagramHandle: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  height: z.number().optional(),
  weight: z.number().optional(),
  measurements: z.object({
    bust: z.string().optional(),
    waist: z.string().optional(),
    hips: z.string().optional(),
  }).optional(),
  shoeSize: z.string().optional(),
  dressSize: z.string().optional(),
  demoReelUrl: z.string().url().optional().or(z.literal("")),
  languagesSpoken: z.string().optional(),
  travelAvailability: z.enum(["Local Only", "Domestic Travel", "International OK"]).optional(),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Professional"]).optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;

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

  const category = form.watch("category");
  const isModel = category === "Top Model";
  const isPerformer = ["Top Performer", "Top Dancer"].includes(category || "");

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
          instagram: data.instagramHandle || null
        },
        height: data.height,
        weight: data.weight,
        measurements: data.measurements,
        shoe_size: data.shoeSize,
        dress_size: data.dressSize,
        demo_reel_url: data.demoReelUrl,
        languages_spoken: data.languagesSpoken?.split(",").map(lang => lang.trim()),
        travel_availability: data.travelAvailability,
        experience_level: data.experienceLevel,
        portfolio_url: data.portfolioUrl,
        status: "pending"
      };
      
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
        description: "Thank you for registering! Our team will review your information and reach out to selected talent for the next stage.",
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <BasicInfoSection form={form} />
            
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

            <ModelMeasurementsSection form={form} show={isModel} />
            <PerformerSection form={form} show={isPerformer} />
            <SocialSection form={form} />

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
