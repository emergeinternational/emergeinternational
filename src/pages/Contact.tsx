
import React from 'react';
import { Mail, Phone, MapPin, Send } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For now, just show a success message
    toast({
      title: "Message sent!",
      description: "Thanks! We'll get back to you soon.",
    });
    
    // Reset the form
    (e.target as HTMLFormElement).reset();
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
                  <Mail className="text-emerge-gold mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">Email Us</h3>
                    <p className="text-gray-600">
                      For general inquiries and support
                    </p>
                    <a href="mailto:contact@emerge.com" className="text-emerge-gold hover:underline">
                      contact@emerge.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="text-emerge-gold mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">Call Us</h3>
                    <p className="text-gray-600">
                      Monday to Friday, 9am - 5pm EAT
                    </p>
                    <a href="tel:+251111234567" className="text-emerge-gold hover:underline">
                      +251 11 123 4567
                    </a>
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
                      World Headquarters,<br />
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
                      South America
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
