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
import { ModelMeasurementsSection } from "../talent/FormSections/ModelMeasurementsSection";

const mediaFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.string().min(1, "Age is required"),
  category: z.enum(["Model", "Dancer", "Singer", "Actor", "Designer", "Other"]),
  gender: z.enum(["Male", "Female"], {
    required_error: "Gender selection is required",
  }),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  talentDescription: z.string()
    .min(10, "Please provide a description")
    .max(300, "Description must not exceed 300 characters"),
  measurements: z.object({
    height: z.string().optional(),
    weight: z.string().optional(),
    chest: z.string().optional(),
    bust: z.string().optional(),
    waist: z.string().optional(),
    hips: z.string().optional(),
    shoulders: z.string().optional(),
    inseam: z.string().optional(),
  }).optional(),
  dressSize: z.string().optional(),
  shoeSize: z.string().optional(),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tiktok: z.string().optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;

interface MediaSubmissionFormProps {
  onSubmitSuccess: () => void;
}

const MediaSubmissionForm = ({ onSubmitSuccess }: MediaSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      category: undefined,
      gender: undefined,
    },
  });

  const category = form.watch("category");
  const gender = form.watch("gender");
  const showModelMeasurements = category === "Model" && gender;

  const onSubmit = async (data: MediaFormData) => {
    try {
      setIsSubmitting(true);
      
      const submissionData = {
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber,
        age: parseInt(data.age, 10),
        category: data.category,
        gender: data.gender,
        instagram: data.instagram || null,
        telegram: data.telegram || null,
        talent_description: data.talentDescription,
        measurements: showModelMeasurements ? data.measurements : null,
        portfolio_url: data.category === "Designer" ? data.portfolioUrl : null,
        tiktok: data.tiktok || null,
      };
      
      console.log("Submitting entry:", submissionData);
      
      const { error } = await supabase
        .from('emerge_submissions')
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
      onSubmitSuccess();
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
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-serif text-emerge-darkBg mb-6 text-center">
        Talent Registration Form
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Age" {...field} />
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
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@yourusername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@yourtelegram" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@yourtiktok" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Portfolio URL for Designers */}
          {category === "Designer" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Portfolio Information</h3>
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Portfolio or Website</FormLabel>
                    <FormControl>
                      <Input 
                        type="url" 
                        placeholder="https://yourportfolio.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Model Measurements Section */}
          {showModelMeasurements && (
            <ModelMeasurementsSection 
              form={form} 
              show={!!showModelMeasurements} 
              gender={gender || ""} 
            />
          )}

          {/* Talent Description Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <FormField
              control={form.control}
              name="talentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Talent Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your experience and skills (max 300 characters)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MediaSubmissionForm;
