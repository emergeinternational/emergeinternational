
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Share2, User, Clock, Mail, Phone } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { fetchEventDetails, EventWithTickets, TicketType } from "@/services/eventService";
import { fetchCurrencies, Currency, convertCurrency, formatCurrency } from "@/services/currencyService";
import { fetchPaymentMethods, PaymentMethod, uploadPaymentProof } from "@/services/paymentService";
import { registerForEvent } from "@/services/eventService";
import { CurrencySelector } from "@/components/events/CurrencySelector";
import { TicketSelector } from "@/components/events/TicketSelector";
import { CountdownTimer } from "@/components/events/CountdownTimer";
import { PaymentMethodSelector } from "@/components/events/PaymentMethodSelector";
import { DiscountCodeInput } from "@/components/events/DiscountCodeInput";
import { PaymentProofUploader } from "@/components/events/PaymentProofUploader";
import { PaymentSummary } from "@/components/events/PaymentSummary";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State
  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState<number | undefined>(undefined);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  
  // Fetch event details
  useEffect(() => {
    const loadEventDetails = async () => {
      if (!id) return;
      
      try {
        const eventData = await fetchEventDetails(id);
        if (eventData) {
          setEvent(eventData);
          
          // Select first ticket by default if available
          if (eventData.tickets && eventData.tickets.length > 0) {
            setSelectedTicket(eventData.tickets[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({
          title: "Error loading event",
          description: "Could not load event details. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    loadEventDetails();
  }, [id, toast]);
  
  // Fetch currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencyData = await fetchCurrencies();
        setCurrencies(currencyData);
        
        // Set default currency to ETB
        const defaultCurrency = currencyData.find(c => c.code === "ETB") || currencyData[0];
        setSelectedCurrency(defaultCurrency);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };
    
    loadCurrencies();
  }, []);
  
  // Fetch payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await fetchPaymentMethods();
        setPaymentMethods(methods);
        
        // Set default payment method
        if (methods && methods.length > 0) {
          setSelectedPaymentMethod(methods[0].id);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    
    loadPaymentMethods();
  }, []);
  
  if (!event || !selectedCurrency) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="flex justify-center">
            <div className="animate-pulse text-emerge-gold">Loading event details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const eventDate = new Date(event.date);
  const selectedTicketData = event.tickets.find(t => t.id === selectedTicket);
  
  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };
  
  const handleApplyDiscount = (percent?: number, amount?: number) => {
    setDiscountPercent(percent);
    setDiscountAmount(amount);
  };
  
  const handlePaymentProofUpload = (file: File) => {
    setPaymentProofFile(file);
  };
  
  const handleCheckout = () => {
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }
    
    if (!selectedTicket || !selectedTicketData) {
      toast({
        title: "Please select a ticket",
        description: "You must select a ticket to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckoutOpen(true);
  };
  
  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };
  
  const handleCompletePayment = async () => {
    if (!selectedTicketData || !selectedCurrency || !selectedPaymentMethod) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    if (selectedMethod?.requires_verification && !paymentProofFile) {
      toast({
        title: "Payment proof required",
        description: "Please upload your payment proof to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate pricing
      let ticketPrice = selectedTicketData.price;
      if (selectedCurrency.code !== event.currency_code) {
        const baseRate = currencies.find(c => c.code === event.currency_code)?.exchange_rate || 1;
        const targetRate = selectedCurrency.exchange_rate;
        ticketPrice = convertCurrency(ticketPrice, baseRate, targetRate);
      }
      
      // Calculate discount
      let finalPrice = ticketPrice * ticketQuantity;
      if (discountPercent) {
        finalPrice -= finalPrice * (discountPercent / 100);
      } else if (discountAmount) {
        finalPrice -= discountAmount;
      }
      
      // Calculate exchange rate
      const exchangeRate = selectedCurrency.code !== event.currency_code
        ? selectedCurrency.exchange_rate / (currencies.find(c => c.code === event.currency_code)?.exchange_rate || 1)
        : 1;
      
      const result = await registerForEvent(
        event.id,
        selectedTicket,
        selectedTicketData.type,
        finalPrice,
        selectedCurrency.code,
        selectedPaymentMethod,
        selectedTicketData.price * ticketQuantity, // Original price in event's currency
        exchangeRate
      );
      
      if (result.success && result.registrationId) {
        setRegistrationId(result.registrationId);
        
        // If payment requires verification, upload the proof
        if (selectedMethod?.requires_verification && paymentProofFile) {
          await uploadPaymentProof(result.registrationId, paymentProofFile);
        }
        
        setIsCheckoutOpen(false);
        setSuccessDialogOpen(true);
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "There was an error processing your registration.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error completing payment:", error);
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogin = () => {
    setLoginDialogOpen(false);
    navigate("/login", { state: { returnUrl: `/events/${id}` } });
  };
  
  const getTicketPrice = (ticket: TicketType): number => {
    let price = ticket.price;
    
    if (selectedCurrency && selectedCurrency.code !== event.currency_code) {
      const baseRate = currencies.find(c => c.code === event.currency_code)?.exchange_rate || 1;
      const targetRate = selectedCurrency.exchange_rate;
      price = convertCurrency(price, baseRate, targetRate);
    }
    
    return price;
  };
  
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <h1 className="text-3xl font-semibold text-emerge-darkBg">{event.name}</h1>
                
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                  
                  <CurrencySelector
                    currencies={currencies}
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={handleCurrencyChange}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-emerge-gold" />
                  <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                {event.start_time && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-emerge-gold" />
                    <span>
                      {format(new Date(`2000-01-01T${event.start_time}`), "h:mm a")}
                      {event.end_time && ` - ${format(new Date(`2000-01-01T${event.end_time}`), "h:mm a")}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-emerge-gold" />
                  <span>{event.location}</span>
                </div>
                {event.organizer && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-emerge-gold" />
                    <span>{event.organizer}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <CountdownTimer targetDate={eventDate} className="mb-2" />
                <div className="text-center text-sm text-gray-600">until event starts</div>
              </div>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="organizer">Organizer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                {event.description && (
                  <div className="prose max-w-none">
                    <p>{event.description}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="venue" className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Location</h3>
                <p>{event.location}</p>
                
                {event.venue_map && (
                  <div className="mt-4">
                    <img 
                      src={event.venue_map} 
                      alt="Venue Map" 
                      className="max-w-full rounded-lg border"
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="organizer" className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Organizer Information</h3>
                {event.organizer && <p><strong>Name:</strong> {event.organizer}</p>}
                
                <div className="space-y-2 mt-4">
                  {event.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-emerge-gold" />
                      <a href={`mailto:${event.contact_email}`} className="text-blue-600 hover:underline">
                        {event.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {event.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-emerge-gold" />
                      <a href={`tel:${event.contact_phone}`} className="text-blue-600 hover:underline">
                        {event.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
                
                {event.social_links && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Follow</h4>
                    <div className="flex space-x-3">
                      {event.social_links.facebook && (
                        <a href={event.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Facebook
                        </a>
                      )}
                      {event.social_links.twitter && (
                        <a href={event.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Twitter
                        </a>
                      )}
                      {event.social_links.instagram && (
                        <a href={event.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Instagram
                        </a>
                      )}
                      {event.social_links.website && (
                        <a href={event.social_links.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Get Tickets</h2>
              
              {event.tickets && event.tickets.length > 0 ? (
                <div className="space-y-6">
                  <TicketSelector
                    tickets={event.tickets}
                    selectedTicket={selectedTicket}
                    ticketQuantity={ticketQuantity}
                    onTicketSelect={setSelectedTicket}
                    onQuantityChange={setTicketQuantity}
                    selectedCurrency={selectedCurrency}
                    currencies={currencies}
                    baseCurrency={event.currency_code}
                  />
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>
                      {selectedTicketData && formatCurrency(
                        getTicketPrice(selectedTicketData) * ticketQuantity,
                        selectedCurrency.code,
                        currencies
                      )}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full bg-emerge-gold hover:bg-emerge-gold/90"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={!selectedTicket}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No tickets available for this event</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Please review your order and select a payment method.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Event</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium">{event.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(eventDate, "EEE, MMM d, yyyy")}
                    {event.start_time && ` • ${format(new Date(`2000-01-01T${event.start_time}`), "h:mm a")}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                </div>
              </div>
              
              <DiscountCodeInput
                eventId={event.id}
                selectedCurrency={selectedCurrency}
                currencies={currencies}
                baseCurrency={event.currency_code}
                onApplyDiscount={handleApplyDiscount}
              />
              
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                onMethodChange={setSelectedPaymentMethod}
              />
              
              {selectedPaymentMethod && paymentMethods.find(m => m.id === selectedPaymentMethod)?.requires_verification && (
                <PaymentProofUploader onFileSelected={handlePaymentProofUpload} />
              )}
            </div>
            
            <div>
              {selectedTicketData && (
                <div className="space-y-6">
                  <PaymentSummary
                    ticketType={selectedTicketData.type}
                    ticketPrice={getTicketPrice(selectedTicketData)}
                    quantity={ticketQuantity}
                    discountPercent={discountPercent}
                    discountAmount={discountAmount}
                    selectedCurrency={selectedCurrency}
                    currencies={currencies}
                  />
                  
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      By completing this purchase, you agree to the event's terms and conditions.
                    </p>
                    <p>
                      Event tickets are non-refundable unless the event is cancelled by the organizer.
                    </p>
                  </div>
                  
                  <Button
                    className="w-full bg-emerge-gold hover:bg-emerge-gold/90"
                    size="lg"
                    onClick={handleCompletePayment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Complete Purchase"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Login Prompt Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to purchase tickets.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin}>
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Successful!</DialogTitle>
            <DialogDescription>
              Your ticket purchase has been registered successfully.
              {paymentMethods.find(m => m.id === selectedPaymentMethod)?.requires_verification && (
                <p className="mt-2">
                  Your payment is pending verification. You will receive a confirmation once it's approved.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-green-700">
              Check your profile for ticket details and status.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setSuccessDialogOpen(false);
                navigate("/profile");
              }}
            >
              View My Tickets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default EventDetail;
