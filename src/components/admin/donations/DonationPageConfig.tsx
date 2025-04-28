import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { DonationPageSettings } from "@/services/donationTypes";

const formSchema = z.object({
  hero_title: z.string().min(2, {
    message: "Hero title must be at least 2 characters.",
  }),
  hero_description: z.string().optional(),
  hero_image_url: z.string().url({ message: "Invalid URL" }).optional(),
  payment_methods: z.array(z.string()).optional(),
  currency_options: z.array(z.string()).optional(),
  suggested_amounts: z.array(z.number()).optional(),
  min_donation_amount: z.number().optional(),
  max_donation_amount: z.number().optional(),
  thank_you_message: z.string().optional(),
  is_active: z.boolean().default(false),
  featured_member: z.object({
    name: z.string(),
    role: z.string(),
    image_url: z.string().url({ message: "Invalid URL" }),
    description: z.string(),
  }).optional(),
});

const DonationPageConfig = () => {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['donation-page-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_page_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as DonationPageSettings;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hero_title: settings?.hero_title || "",
      hero_description: settings?.hero_description || "",
      hero_image_url: settings?.hero_image_url || "",
      payment_methods: settings?.payment_methods || [],
      currency_options: settings?.currency_options || [],
      suggested_amounts: settings?.suggested_amounts || [],
      min_donation_amount: settings?.min_donation_amount || 1,
      max_donation_amount: settings?.max_donation_amount || 1000,
      thank_you_message: settings?.thank_you_message || "",
      is_active: settings?.is_active || false,
      featured_member: settings?.featured_member || {
        name: "",
        role: "",
        image_url: "",
        description: "",
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await supabase
        .from("donation_page_settings")
        .upsert(
          [
            {
              id: settings?.id || undefined,
              ...values,
            },
          ],
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("Error updating donation page settings:", error);
        toast({
          title: "Error",
          description: "Failed to update donation page settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Donation page settings updated successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto mt-10 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Donation Page Configuration</CardTitle>
          <CardDescription>
            Manage settings for the donation page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hero_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hero title" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Textarea
                          placeholder="Enter hero description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hero_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hero image URL" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Textarea
                          placeholder="Enter thank you message"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_donation_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Donation Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter minimum amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                          placeholder="Enter maximum amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div>
                <FormLabel>Payment Methods</FormLabel>
                <div className="flex flex-wrap gap-2">
                  <div>
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("credit_card")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        "credit_card",
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "credit_card"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Credit Card
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("paypal")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        "paypal",
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "paypal"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Paypal</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("telebirr")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        "telebirr",
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "telebirr"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Telebirr
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
                <FormDescription>
                  Select the payment methods available for donations.
                </FormDescription>
                <FormMessage />
              </div>

              <Separator />

              <div>
                <FormLabel>Currency Options</FormLabel>
                <div className="flex flex-wrap gap-2">
                  <div>
                    <FormField
                      control={form.control}
                      name="currency_options"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("USD")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        "USD",
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "USD"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">USD</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="currency_options"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("ETB")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        "ETB",
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "ETB"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">ETB</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="currency_options"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes("EUR")}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        "EUR",
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== "EUR"
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">EUR</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
                <FormDescription>
                  Select the currency options available for donations.
                </FormDescription>
                <FormMessage />
              </div>

              <Separator />

              <div>
                <FormLabel>Suggested Donation Amounts</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20, 50, 100].map((amount) => (
                    <div key={amount}>
                      <FormField
                        control={form.control}
                        name="suggested_amounts"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(amount)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          amount,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== amount
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {amount}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
                <FormDescription>
                  Select the suggested donation amounts.
                </FormDescription>
                <FormMessage />
              </div>

              <Separator />

              <div>
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Donation Page Status
                        </FormLabel>
                        <FormDescription>
                          Enable or disable the donation page.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-xl font-semibold mb-4">Featured Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="featured_member.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured_member.role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter role" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured_member.image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured_member.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit">Update Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationPageConfig;
