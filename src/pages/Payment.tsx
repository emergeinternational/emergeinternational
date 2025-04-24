import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Logo from "../components/Logo";
import { QRCodeSVG } from "qrcode.react";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card" | "cbebirr">("telebirr");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const paymentDetails = location.state || {
    amount: 0,
    description: "Payment",
    eventId: null,
    ticketType: null
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshot(reader.result as string);
          toast({
            title: "Screenshot uploaded",
            description: "Your payment screenshot has been uploaded successfully.",
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleUploadScreenshot = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmPurchase = () => {
    if ((paymentMethod === "telebirr" || paymentMethod === "cbebirr") && !screenshot) {
      toast({
        title: "Screenshot required",
        description: "Please upload your payment confirmation screenshot.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Purchase confirmed",
      description: `Your ${paymentMethod} payment for ${paymentDetails.description} has been initiated.`,
    });
    
    setTimeout(() => {
      navigate('/events');
    }, 2000);
  };

  const getQRValue = () => {
    return `EMG-PAY-${paymentDetails.eventId}-${paymentDetails.amount}-${Date.now()}`;
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
            onClick={() => setPaymentMethod("cbebirr")}
            className={`flex-1 py-3 text-center ${
              paymentMethod === "cbebirr" 
                ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
                : "bg-white text-gray-500"
            }`}
          >
            CBEBirr
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
            {paymentMethod === "cbebirr" && "Pay with CBEBirr"}
            {paymentMethod === "card" && "Secure card payment"}
          </p>
        </div>

        {(paymentMethod === "telebirr" || paymentMethod === "cbebirr") ? (
          <div className="space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
            
            <div className="border border-gray-300 p-4 rounded">
              {screenshot ? (
                <div className="relative">
                  <img 
                    src={screenshot} 
                    alt="Payment confirmation" 
                    className="w-full h-48 object-cover rounded"
                  />
                  <button 
                    onClick={handleUploadScreenshot}
                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <Upload size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleUploadScreenshot}
                  className="w-full border-2 border-dashed border-gray-300 py-12 rounded flex flex-col items-center justify-center space-y-2 hover:border-emerge-gold transition-colors"
                >
                  <Camera size={32} className="text-gray-400" />
                  <span className="text-gray-600">Upload Payment Screenshot</span>
                </button>
              )}
            </div>

            <div className="border border-gray-300 p-4 rounded flex flex-col items-center space-y-4">
              <QRCodeSVG
                value={getQRValue()}
                size={200}
                level="H"
                includeMargin
                className="max-w-full"
              />
              <p className="text-sm text-gray-600">Scan QR Code to Pay</p>
            </div>

            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold"
            >
              CONFIRM PURCHASE
            </button>
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
