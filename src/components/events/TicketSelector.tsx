
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TicketType } from "@/services/eventService";
import { formatCurrency } from "@/services/currencyService";
import { Currency } from "@/services/currencyService";
import { Badge } from "@/components/ui/badge";

interface TicketSelectorProps {
  tickets: TicketType[];
  selectedTicket: string;
  ticketQuantity: number;
  onTicketSelect: (ticketId: string) => void;
  onQuantityChange: (quantity: number) => void;
  selectedCurrency: Currency;
  currencies: Currency[];
  baseCurrency: string;
}

export const TicketSelector = ({
  tickets,
  selectedTicket,
  ticketQuantity,
  onTicketSelect,
  onQuantityChange,
  selectedCurrency,
  currencies,
  baseCurrency
}: TicketSelectorProps) => {
  const handleDecrement = () => {
    if (ticketQuantity > 1) {
      onQuantityChange(ticketQuantity - 1);
    }
  };

  const handleIncrement = () => {
    const selected = tickets.find(ticket => ticket.id === selectedTicket);
    const maxAvailable = selected ? Math.max(0, selected.available_quantity - selected.sold_quantity) : 0;
    
    if (ticketQuantity < maxAvailable) {
      onQuantityChange(ticketQuantity + 1);
    }
  };

  // Convert price to selected currency
  const convertPrice = (price: number): number => {
    if (selectedCurrency.code === baseCurrency) return price;
    
    const baseRate = currencies.find(c => c.code === baseCurrency)?.exchange_rate || 1;
    const targetRate = selectedCurrency.exchange_rate;
    
    return (price / baseRate) * targetRate;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Select Ticket Type</h3>
        
        <RadioGroup
          value={selectedTicket}
          onValueChange={onTicketSelect}
          className="space-y-3"
        >
          {tickets.map((ticket) => {
            const remainingTickets = Math.max(0, ticket.available_quantity - ticket.sold_quantity);
            const isAvailable = remainingTickets > 0;
            const convertedPrice = convertPrice(ticket.price);
            
            return (
              <div 
                key={ticket.id} 
                className={`flex items-start p-4 rounded-lg border ${
                  selectedTicket === ticket.id
                    ? "border-emerge-gold bg-amber-50"
                    : "border-gray-200 hover:bg-gray-50"
                } ${!isAvailable ? "opacity-60" : ""}`}
              >
                <RadioGroupItem
                  value={ticket.id}
                  id={ticket.id}
                  disabled={!isAvailable}
                  className="mt-1"
                />
                <div className="ml-3 flex-1">
                  <label
                    htmlFor={ticket.id}
                    className="flex justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{ticket.type}</div>
                      <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                      
                      {ticket.benefits && ticket.benefits.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {ticket.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-center">
                              <span className="mr-1.5 text-emerge-gold">•</span> {benefit}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="mt-2">
                        {remainingTickets > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {remainingTickets} {remainingTickets === 1 ? 'ticket' : 'tickets'} remaining
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Sold Out
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      {formatCurrency(convertedPrice, selectedCurrency.code, currencies)}
                    </div>
                  </label>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
      
      {selectedTicket && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Quantity
          </label>
          <div className="flex items-center">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={handleDecrement}
              disabled={ticketQuantity <= 1}
              className="h-9 w-9"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 w-8 text-center font-medium">
              {ticketQuantity}
            </span>
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={handleIncrement}
              disabled={
                !selectedTicket || 
                tickets.find(t => t.id === selectedTicket)?.available_quantity === 0
              }
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
