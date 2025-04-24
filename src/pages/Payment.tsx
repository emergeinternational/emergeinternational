
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Logo from "../components/Logo";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card">("telebirr");
  const { toast } = useToast();
  
  const handleUploadScreenshot = () => {
    // This would typically open a file selector
    toast({
      title: "Upload feature",
      description: "In a real app, this would open your camera or file picker.",
    });
  };

  const handleConfirmPurchase = () => {
    toast({
      title: "Purchase confirmed",
      description: `Your ${paymentMethod === "telebirr" ? "TeleBirr" : "card"} payment has been initiated.`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/cart" className="flex items-center text-black">
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
            Pay with TeleBirr
          </button>
          <button 
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-3 text-center ${
              paymentMethod === "card" 
                ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
                : "bg-white text-gray-500"
            }`}
          >
            Pay with Card
          </button>
        </div>

        {paymentMethod === "telebirr" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2">ETB 1500</h2>
              <p className="text-gray-600">
                TeleBirr Transfer Confirmation<br />
                Expected within 8 hours
              </p>
            </div>

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

            <div className="border-t border-gray-200 pt-6 mt-6" />

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">Pay with Card</h3>
                <p className="text-gray-600 text-sm">
                  Pay securely via credit<br />card or PayPal
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xl font-semibold">$80 USD</span>
              </div>
            </div>

            <div className="border border-gray-300 p-2 rounded flex justify-center">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600">QR Code Image</span>
              </div>
            </div>
            
            <p className="text-center text-gray-600">Scan QR Code for Entry</p>
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

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>$75.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Processing Fee</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span>$80.00</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold"
            >
              PAY $80.00
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
