
import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
