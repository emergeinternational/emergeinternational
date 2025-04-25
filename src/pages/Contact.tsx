
import React from 'react';
import { Phone, MapPin, Send } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: "Message sent!",
        description: "Thanks! We'll get back to you soon.",
      });
      
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    }
  };

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="emerge-heading text-4xl mb-6">Contact Us</h1>
          <p className="text-lg text-gray-600 mb-12">
            We're here to help emerging fashion talent succeed. Reach out to us with any questions,
            suggestions, or collaboration opportunities.
          </p>

          {/* Contact Form Section */}
          <div className="mb-12">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="Enter your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required placeholder="Enter the subject" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Type your message here"
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" className="w-full md:w-auto" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="text-emerge-gold mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">Call Us</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 font-medium">United States</p>
                        <a href="tel:+16465435666" className="text-emerge-gold hover:underline block">
                          +1 (646) 543-5666
                        </a>
                        <p className="text-gray-600 text-sm">
                          9:00 AM – 5:00 PM EST, Monday to Friday
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Ethiopia</p>
                        <a href="tel:+251937343332" className="text-emerge-gold hover:underline block">
                          +251 937 343 332
                        </a>
                        <p className="text-gray-600 text-sm">
                          10:00 AM – 6:00 PM GMT, Tuesday to Saturday
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-emerge-gold mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">World Headquarters</h3>
                    <p className="text-gray-600">
                      1 Penn Plaza,<br />
                      New York, NYC 10001
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-emerge-gold mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">South America Office</h3>
                    <p className="text-gray-600">
                      25-148 Calle San Juan,<br />
                      Cartagena, Colombia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
