
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";

interface EventDescriptionProps {
  event: {
    name: string;
    date: string;
    description: string;
    location: string;
    benefits?: string[];
  };
}

export const EventDescription: React.FC<EventDescriptionProps> = ({ event }) => {
  const formattedDate = new Date(event.date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-2">
            <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium">Date & Time</p>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-5 h-5 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">About This Event</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>

          {event.benefits && event.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">What You'll Get</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {event.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
