import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Logo from "../components/Logo";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card" | "mpesa">("telebirr");
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const paymentDetails = location.state || {
    amount: 0,
    description: "Payment",
    eventId: null,
    ticketType: null
  };
  
  const handleUploadScreenshot = () => {
    toast({
      title: "Upload feature",
      description: "In a real app, this would open your camera or file picker.",
    });
  };

  const handleConfirmPurchase = () => {
    toast({
      title: "Purchase confirmed",
      description: `Your ${paymentMethod} payment for ${paymentDetails.description} has been initiated.`,
    });
    // In a real app, you would handle the actual payment processing here
    
    // Navigate back to events page after successful payment
    setTimeout(() => {
      navigate('/events');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/events" className="flex items-center text-black">
            <ArrowLeft size={24} className="mr-2" />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <Logo variant="gold" className="mx-auto mb-2" />
        </div>

        <h1 className="text-3xl font-semibold mb-6">Confirm Your Payment</h1>

        {/* Payment Method Tabs */}
        <div className="flex mb-8">
          <button 
            onClick={() => setPaymentMethod("telebirr")}
            className={`flex-1 py-3 text-center ${
              paymentMethod === "telebirr" 
                ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
                : "bg-white text-gray-500"
            }`}
          >
            TeleBirr
          </button>
          <button 
            onClick={() => setPaymentMethod("mpesa")}
            className={`flex-1 py-3 text-center ${
              paymentMethod === "mpesa" 
                ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
                : "bg-white text-gray-500"
            }`}
          >
            M-Pesa
          </button>
          <button 
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-3 text-center ${
              paymentMethod === "card" 
                ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
                : "bg-white text-gray-500"
            }`}
          >
            Card
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">ETB {paymentDetails.amount}</h2>
          <p className="text-gray-600">
            {paymentDetails.description}<br />
            {paymentMethod === "telebirr" && "Expected within 8 hours"}
            {paymentMethod === "mpesa" && "Pay with M-Pesa"}
            {paymentMethod === "card" && "Secure card payment"}
          </p>
        </div>

        {(paymentMethod === "telebirr" || paymentMethod === "mpesa") ? (
          <div className="space-y-6">
            <button 
              onClick={handleUploadScreenshot}
              className="w-full border-2 border-gray-300 py-4 rounded flex items-center justify-center space-x-3"
            >
              <Camera size={24} />
              <span>Upload Payment Screenshot</span>
            </button>

            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold"
            >
              CONFIRM PURCHASE
            </button>

            <div className="border border-gray-300 p-2 rounded flex justify-center mt-6">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600">QR Code</span>
              </div>
            </div>
            
            <p className="text-center text-gray-600">Scan QR Code to Pay</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border p-4 rounded-md bg-white shadow-sm">
              <h3 className="font-medium mb-2">Credit/Debit Card</h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Card Number" 
                  className="emerge-input" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="emerge-input" 
                  />
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    className="emerge-input" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Cardholder Name" 
                  className="emerge-input" 
                />
              </div>
            </div>

            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold"
            >
              PAY ETB {paymentDetails.amount}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
