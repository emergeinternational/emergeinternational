
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCurrency } from '@/hooks/useCurrency';
import { TicketType } from '@/hooks/useEvents';
import { Badge } from "@/components/ui/badge";

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
}

interface TicketSelectorProps {
  tickets: TicketType[];
  selectedTicket: TicketType | null;
  onSelectTicket: (ticket: TicketType) => void;
  currency: Currency | null;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  currency
}) => {
  const { convertPrice } = useCurrency();

  // Helper function to safely convert and format price
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) {
      return 'Free';
    }
    
    try {
      const converted = convertPrice(price);
      return `${currency?.symbol || ''} ${converted.toFixed(2)}`;
    } catch (error) {
      console.error('Error converting price:', error);
      return `${currency?.symbol || ''} ${price.toFixed(2)}`;
    }
  };

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center p-4 border rounded bg-gray-50">
        <p className="text-gray-500">No tickets available for this event.</p>
      </div>
    );
  }

  return (
    <RadioGroup 
      value={selectedTicket?.id}
      onValueChange={(value) => {
        const ticket = tickets.find(t => t.id === value);
        if (ticket) {
          onSelectTicket(ticket);
        }
      }}
      className="space-y-3"
    >
      {tickets.map((ticket) => {
        const availableQuantity = (ticket.quantity || 0) - (ticket.tickets_sold || 0);
        const isSoldOut = availableQuantity <= 0;
        
        return (
          <div
            key={ticket.id}
            className={`relative border rounded-md p-4 transition-colors ${
              selectedTicket?.id === ticket.id 
                ? 'border-emerge-gold bg-emerge-cream/20' 
                : 'hover:bg-gray-50'
            } ${isSoldOut ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value={ticket.id} 
                id={`ticket-${ticket.id}`}
                disabled={isSoldOut}
              />
              <Label 
                htmlFor={`ticket-${ticket.id}`} 
                className="flex-grow cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{ticket.name}</span>
                  <div className="flex items-center space-x-2">
                    {availableQuantity <= 5 && availableQuantity > 0 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Only {availableQuantity} left
                      </Badge>
                    )}
                    <span className="font-bold">
                      {formatPrice(ticket.price)}
                    </span>
                  </div>
                </div>
                
                {ticket.description && (
                  <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                )}
                
                {isSoldOut && (
                  <Badge variant="secondary" className="mt-2 bg-red-100 text-red-700">
                    Sold Out
                  </Badge>
                )}
                
                {/* Add ticket benefits if available */}
                {ticket.benefits && ticket.benefits.length > 0 && (
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    {ticket.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="mr-1">•</span> {benefit}
                      </li>
                    ))}
                  </ul>
                )}
              </Label>
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
};
