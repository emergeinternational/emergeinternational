
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Globe, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const talentFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  age: z.string().min(1, "Age is required"),
  category: z.enum(["Model", "Dancer", "Singer", "Actor", "Designer", "Other"]),
  description: z.string().min(10, "Please provide a description").max(300, "Description must not exceed 300 characters"),
  instagramHandle: z.string().optional(),
  telegramHandle: z.string().optional(),
});

type TalentFormData = z.infer<typeof talentFormSchema>;
type TalentStatus = "pending" | "approved" | "rejected" | "on_hold";

const TalentRegistration = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<TalentFormData>({
    resolver: zodResolver(talentFormSchema),
    defaultValues: {
      category: undefined,
    },
  });

  const benefits = [
    {
      icon: Search,
      title: "Get Discovered",
      description: "Join our database of exceptional talent and get noticed by top brands and agencies."
    },
    {
      icon: Globe,
      title: "International Exposure",
      description: "Connect with opportunities worldwide through our global network of industry professionals."
    },
    {
      icon: TrendingUp,
      title: "Professional Growth",
      description: "Access exclusive casting calls and opportunities to advance your career."
    }
  ];

  const onSubmit = async (data: TalentFormData) => {
    try {
      const socialMedia = {
        instagram: data.instagramHandle || null,
        telegram: data.telegramHandle || null,
      };

      const submissionData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        age: parseInt(data.age, 10),
        category_type: data.category,
        notes: data.description,
        social_media: socialMedia,
        status: 'pending' as TalentStatus,
        skills: [data.category]
      };

      console.log("Submitting talent application:", submissionData);

      const { error } = await supabase
        .from('talent_applications')
        .insert(submissionData);

      if (error) {
        console.error("Supabase insertion error:", error);
        toast({
          title: "Submission Failed",
          description: `There was a problem submitting your registration: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Your registration has been submitted successfully.",
      });
      
      form.reset();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Submission error: ${error.message}` 
          : "There was a problem submitting your registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitSuccess = () => {
    setIsSubmitted(true);
    
    // Scroll to the top of the success message
    setTimeout(() => {
      window.scrollTo({ 
        top: document.querySelector('.emerge-container.max-w-3xl')?.getBoundingClientRect().top,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center bg-emerge-darkBg text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=2070&h=1000')"
          }}
        />
        <div className="emerge-container relative z-20 text-center py-20">
          <h1 className="text-4xl md:text-6xl font-serif mb-6">
            Are You the Next Big Talent?
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Join our international database for castings, campaigns, and live events.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-emerge-cream">
        <div className="emerge-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerge-gold text-white mb-4">
                  <benefit.icon size={32} />
                </div>
                <h3 className="text-xl font-serif text-emerge-darkBg mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-20">
        <div className="emerge-container max-w-3xl">
          {isSubmitted ? (
            <div className="text-center p-8 bg-emerge-cream rounded-lg">
              <h2 className="text-2xl font-serif text-emerge-darkBg mb-4">
                Thank You for Registering!
              </h2>
              <p className="text-gray-600 mb-6">
                Your application has been successfully submitted. We will review your information and contact you regarding upcoming opportunities.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
              >
                Submit Another Application
              </Button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-serif text-emerge-darkBg mb-6 text-center">
                Talent Registration Form
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="instagramHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="@yourusername" {...field} />
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
                          <FormLabel>Telegram Handle</FormLabel>
                          <FormControl>
                            <Input placeholder="@yourtelegram" {...field} />
                          </FormControl>
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

                  <Button 
                    type="submit" 
                    className="w-full"
                  >
                    Submit Registration
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section Placeholder */}
      <section className="py-20 bg-emerge-cream">
        <div className="emerge-container text-center">
          <h2 className="text-3xl font-serif text-emerge-darkBg mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Coming soon - Check back for detailed information about our casting process.
          </p>
        </div>
      </section>
      
      {/* Make sure toast notifications are visible */}
      <Toaster />
    </MainLayout>
  );
};

export default TalentRegistration;
