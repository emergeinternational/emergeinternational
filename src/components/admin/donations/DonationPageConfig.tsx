import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DonationPageSettings } from "@/services/donationTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DonationPageConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [minDonation, setMinDonation] = useState(10);
  const [maxDonation, setMaxDonation] = useState(10000);
  const [suggestedAmounts, setSuggestedAmounts] = useState<number[]>([50, 100, 250, 500]);
  const [currencyOptions, setCurrencyOptions] = useState<string[]>(["ETB", "USD"]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["card", "bank_transfer", "mobile_money"]);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // New amount input for suggested amounts
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["donation-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_page_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data as DonationPageSettings;
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: Partial<DonationPageSettings>) => {
      const { error } = await supabase
        .from("donation_page_settings")
        .update(updatedSettings)
        .eq("id", settings?.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-page-settings"] });
      toast({
        title: "Settings updated",
        description: "Donation page settings have been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Load settings into form state
  useEffect(() => {
    if (settings) {
      setHeroTitle(settings.hero_title);
      setHeroDescription(settings.hero_description || "");
      setHeroImageUrl(settings.hero_image_url || "");
      setMinDonation(settings.min_donation_amount);
      setMaxDonation(settings.max_donation_amount);
      setSuggestedAmounts(settings.suggested_amounts || []);
      setCurrencyOptions(settings.currency_options || []);
      setPaymentMethods(settings.payment_methods || []);
      setThankYouMessage(settings.thank_you_message);
      setIsActive(settings.is_active);
    }
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings.mutate({
      hero_title: heroTitle,
      hero_description: heroDescription || null,
      hero_image_url: heroImageUrl || null,
      min_donation_amount: minDonation,
      max_donation_amount: maxDonation,
      suggested_amounts: suggestedAmounts,
      currency_options: currencyOptions,
      payment_methods: paymentMethods,
      thank_you_message: thankYouMessage,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    });
  };

  const addSuggestedAmount = () => {
    if (newAmount && !suggestedAmounts.includes(Number(newAmount))) {
      setSuggestedAmounts([...suggestedAmounts, Number(newAmount)]);
      setNewAmount("");
    }
  };

  const removeSuggestedAmount = (amount: number) => {
    setSuggestedAmounts(suggestedAmounts.filter(a => a !== amount));
  };

  const addCurrency = () => {
    if (newCurrency && !currencyOptions.includes(newCurrency)) {
      setCurrencyOptions([...currencyOptions, newCurrency]);
      setNewCurrency("");
    }
  };

  const removeCurrency = (currency: string) => {
    setCurrencyOptions(currencyOptions.filter(c => c !== currency));
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod && !paymentMethods.includes(newPaymentMethod)) {
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setNewPaymentMethod("");
    }
  };

  const removePaymentMethod = (method: string) => {
    setPaymentMethods(paymentMethods.filter(m => m !== method));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Donation Page Settings</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Configure the main donation page hero section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="hero-title">Hero Title</Label>
              <Input
                id="hero-title"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="hero-description">Hero Description</Label>
              <Textarea
                id="hero-description"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="hero-image">Hero Image URL</Label>
              <Input
                id="hero-image"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                disabled={!isEditing}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation Settings</CardTitle>
          <CardDescription>Configure donation amounts and options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-donation">Minimum Donation Amount</Label>
              <Input
                id="min-donation"
                type="number"
                value={minDonation}
                onChange={(e) => setMinDonation(Number(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="max-donation">Maximum Donation Amount</Label>
              <Input
                id="max-donation"
                type="number"
                value={maxDonation}
                onChange={(e) => setMaxDonation(Number(e.target.value))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label>Suggested Donation Amounts</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedAmounts.map((amount) => (
                <div
                  key={amount}
                  className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                >
                  <span>{amount}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeSuggestedAmount(amount)}
                    >
                      <Trash className="h-3 w-3 text-gray-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Add amount"
                  className="max-w-[150px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSuggestedAmount}
                  disabled={!newAmount}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label>Currency Options</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {currencyOptions.map((currency) => (
                <div
                  key={currency}
                  className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                >
                  <span>{currency}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeCurrency(currency)}
                    >
                      <Trash className="h-3 w-3 text-gray-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  placeholder="Add currency (e.g. USD)"
                  className="max-w-[150px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCurrency}
                  disabled={!newCurrency}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label>Payment Methods</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {paymentMethods.map((method) => (
                <div
                  key={method}
                  className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                >
                  <span>{method}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removePaymentMethod(method)}
                    >
                      <Trash className="h-3 w-3 text-gray-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  placeholder="Add payment method"
                  className="max-w-[200px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPaymentMethod}
                  disabled={!newPaymentMethod}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thank You Message</CardTitle>
          <CardDescription>Message displayed after successful donation</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={thankYouMessage}
            onChange={(e) => setThankYouMessage(e.target.value)}
            disabled={!isEditing}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={!isEditing}
              id="page-active"
            />
            <Label htmlFor="page-active">
              Donation page is {isActive ? "active" : "inactive"}
            </Label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            When inactive, the donation page will show a message that donations are temporarily unavailable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationPageConfig;
