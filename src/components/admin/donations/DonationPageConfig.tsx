
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { DonationPageSettings } from "@/services/donationTypes";

const settingsSchema = z.object({
  hero_title: z.string().min(1, "Title is required"),
  hero_description: z.string().nullable(),
  hero_image_url: z.string().nullable(),
  min_donation_amount: z.number().min(0),
  max_donation_amount: z.number().min(0),
  suggested_amounts: z.array(z.number()),
  currency_options: z.array(z.string()),
  payment_methods: z.array(z.string()),
  thank_you_message: z.string(),
});

const DonationPageConfig = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: settings, refetch } = useQuery<DonationPageSettings>({
    queryKey: ["donation-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_page_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
      hero_title: "",
      hero_description: "",
      hero_image_url: "",
      min_donation_amount: 10,
      max_donation_amount: 1000000,
      suggested_amounts: [20, 50, 100, 500],
      currency_options: ["ETB", "USD"],
      payment_methods: ["bank_transfer", "mobile_money"],
      thank_you_message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("donation_page_settings")
        .update(values)
        .eq("id", settings?.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "The donation page settings have been updated successfully.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Page Settings</CardTitle>
        <CardDescription>
          Customize how the donation page appears to your users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hero_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hero_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="min_donation_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Donation Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_donation_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Donation Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thank_you_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thank You Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    This message will be shown after a successful donation
                  </FormDescription>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DonationPageConfig;
