import React, { useState } from 'react';
import { Mail, Phone, MapPin } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!name || !email || !message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission (replace with actual form submission logic)
    toast({
      title: "Message Sent",
      description: "We'll get back to you soon!",
      variant: "default"
    });

    // Reset form after submission
    setName('');
    setEmail('');
    setMessage('');
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

          <div className="bg-emerge-lightCream p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-serif text-emerge-darkBg mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full min-h-[150px]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-emerge-gold hover:bg-emerge-darkGold text-white"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
