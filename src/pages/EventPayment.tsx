
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/components/events/EventDetails";
import { TicketSelector } from "@/components/events/TicketSelector";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { DiscountCodeInput } from "@/components/payment/DiscountCodeInput";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { Event, TicketType } from "@/hooks/useEvents";

const EventPayment = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedCurrency, convertPrice } = useCurrency();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card" | "cbebirr">("telebirr");
  const [discountCode, setDiscountCode] = useState('');
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    type: 'percent' | 'amount';
    value: number;
  } | null>(null);

  useEffect(() => {
    if (!eventId) return;
    
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (eventError) throw eventError;
        
        // Fetch ticket types
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .order('price', { ascending: true });
        
        if (ticketsError) throw ticketsError;
        
        // Transform the tickets data to match our TicketType interface
        const formattedTickets: TicketType[] = ticketsData.map(ticket => ({
          ...ticket,
          available_quantity: (ticket.quantity || 0) - (ticket.tickets_sold || 0)
        }));
        
        setEvent(eventData as Event);
        setTicketTypes(formattedTickets);
        
        // Don't auto-select a ticket - make user explicitly choose
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast({
          title: "Error fetching event details",
          description: "Unable to load event information. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId, toast]);

  const handleTicketChange = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    calculateFinalPrice(ticket.price, discountAmount);
  };

  const calculateFinalPrice = (basePrice: number, discount: number) => {
    const newPrice = Math.max(0, basePrice - discount);
    setFinalPrice(newPrice);
    return newPrice;
  };

  const handleDiscountCodeApply = async () => {
    if (!discountCode.trim() || !eventId) return;
    
    setIsValidatingDiscount(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.trim())
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        toast({
          title: "Invalid discount code",
          description: "The code you entered is not valid or doesn't apply to this event.",
          variant: "destructive",
        });
        return;
      }
      
      const now = new Date();
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;
      
      if (validUntil && validUntil < now) {
        toast({
          title: "Expired discount code",
          description: "This discount code has expired.",
          variant: "destructive",
        });
        return;
      }
      
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({
          title: "Discount code limit reached",
          description: "This discount code has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      // Calculate discount amount
      let discount = 0;
      let discountType: 'percent' | 'amount' = 'amount';
      let discountValue = 0;
      
      if (data.discount_amount) {
        discount = data.discount_amount;
        discountType = 'amount';
        discountValue = data.discount_amount;
      } else if (data.discount_percent && selectedTicket) {
        discount = selectedTicket.price * (data.discount_percent / 100);
        discountType = 'percent';
        discountValue = data.discount_percent;
      }
      
      setDiscountAmount(discount);
      calculateFinalPrice(selectedTicket?.price || 0, discount);
      
      setAppliedDiscount({
        code: data.code,
        amount: discount,
        type: discountType,
        value: discountValue
      });
      
      toast({
        title: "Discount code applied!",
        description: `A discount of ${selectedCurrency?.symbol} ${discount.toFixed(2)} has been applied.`,
      });
      
      // Increment usage count for the discount code
      const { error: updateError } = await supabase
        .from('discount_codes')
        .update({ 
          current_uses: data.current_uses + 1 
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating discount code usage:', updateError);
      }
      
    } catch (error) {
      console.error('Error validating discount code:', error);
      toast({
        title: "Error validating code",
        description: "There was an error validating your discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountAmount(0);
    setAppliedDiscount(null);
    setDiscountCode('');
    calculateFinalPrice(selectedTicket?.price || 0, 0);
    
    toast({
      title: "Discount removed",
      description: "The discount has been removed from your order.",
    });
  };

  const handlePayNow = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to purchase tickets.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/event-payment/${eventId}` } });
      return;
    }
    
    if (!selectedTicket) {
      toast({
        title: "Select a ticket",
        description: "Please select a ticket type to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare payment details
      const paymentDetails = {
        amount: finalPrice,
        description: `${event?.name} - ${selectedTicket.name}`,
        eventId: eventId,
        ticketType: selectedTicket.id,
        discountApplied: appliedDiscount ? {
          code: appliedDiscount.code,
          amount: appliedDiscount.amount
        } : null
      };
      
      // Navigate to payment page with details
      navigate('/payment', { state: paymentDetails });
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment error",
        description: "There was an error initiating your payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12 flex justify-center items-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin text-emerge-gold" />
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Event not found</h2>
            <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate('/events')}
              className="mt-4"
            >
              Back to Events
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="md:col-span-2">
            <EventDetails event={event} />
          </div>
          
          {/* Right Column - Ticket Selection and Payment */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Select Your Ticket</h3>
                
                <TicketSelector 
                  tickets={ticketTypes}
                  selectedTicket={selectedTicket}
                  onSelectTicket={handleTicketChange}
                  currency={selectedCurrency}
                />
                
                {selectedTicket && (
                  <>
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Apply Discount Code</h3>
                      {appliedDiscount ? (
                        <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-emerald-800">{appliedDiscount.code}</p>
                              <p className="text-sm text-emerald-700">
                                {appliedDiscount.type === 'percent' 
                                  ? `${appliedDiscount.value}% off` 
                                  : `${selectedCurrency?.symbol} ${appliedDiscount.value} off`}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-sm text-red-600"
                              onClick={handleRemoveDiscount}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <DiscountCodeInput
                          discountCode={discountCode}
                          onDiscountCodeChange={setDiscountCode}
                          onApplyDiscount={handleDiscountCodeApply}
                          isValidating={isValidatingDiscount}
                        />
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Choose Payment Method</h3>
                      <PaymentMethodSelector 
                        paymentMethod={paymentMethod}
                        onMethodChange={setPaymentMethod}
                      />
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Ticket Price:</span>
                        <span>
                          {selectedCurrency?.symbol} {convertPrice(selectedTicket.price).toFixed(2)}
                        </span>
                      </div>
                      
                      {appliedDiscount && (
                        <div className="flex justify-between py-2 text-emerald-600">
                          <span>Discount:</span>
                          <span>
                            -{selectedCurrency?.symbol} {convertPrice(appliedDiscount.amount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-2 border-t border-b font-bold">
                        <span>Total Payment:</span>
                        <span className="text-lg">
                          {selectedCurrency?.symbol} {convertPrice(finalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full mt-6 bg-black hover:bg-gray-800 text-white"
                      onClick={handlePayNow}
                      disabled={isProcessing || !selectedTicket}
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        'Pay Now'
                      )}
                    </Button>
                  </>
                )}
                
                {!selectedTicket && (
                  <div className="mt-6 text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">Please select a ticket type to continue to payment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventPayment;
