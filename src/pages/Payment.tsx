import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, CheckCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Logo from "../components/Logo";
import { QRCodeSVG } from "qrcode.react";
import { saveEventRegistration, updatePaymentProof } from "@/services/workshopService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDiscountCode } from '@/hooks/useDiscountCode';
import { usePaymentProof } from '@/hooks/usePaymentProof';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card" | "cbebirr">("telebirr");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const paymentDetails = location.state || {
    amount: 0,
    description: "Payment",
    eventId: null,
    ticketType: null
  };

  const [discountCode, setDiscountCode] = useState('');
  const { validateDiscountCode, isValidating } = useDiscountCode(paymentDetails.eventId);
  const { uploadPaymentProof, isUploading } = usePaymentProof();

  const handleDiscountCodeSubmit = async () => {
    if (!discountCode.trim()) return;
    
    const discountAmount = await validateDiscountCode(discountCode);
    if (discountAmount > 0) {
      // Update the payment amount with the discount
      // Note: This assumes paymentDetails is properly typed with amount
      paymentDetails.amount -= discountAmount;
    }
  };

  useEffect(() => {
    // Create the registration when the component mounts
    const createRegistration = async () => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to register for events.",
          variant: "destructive"
        });
        navigate('/login', { state: { from: location } });
        return;
      }

      if (paymentDetails.eventId && paymentDetails.ticketType) {
        try {
          const registration = await saveEventRegistration(
            paymentDetails.eventId,
            paymentDetails.ticketType,
            paymentDetails.amount
          );
          setRegistrationId(registration.id);
        } catch (error) {
          console.error("Error creating registration:", error);
          toast({
            title: "Registration Error",
            description: "There was an error creating your registration. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    if (paymentDetails.eventId && !registrationId) {
      createRegistration();
    }
  }, [paymentDetails, user, toast, navigate, location, registrationId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }
    
    // Show the preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload to Supabase Storage
    if (registrationId) {
      setUploading(true);
      try {
        const paymentProofUrl = await uploadPaymentProof(file);
        
        if (paymentProofUrl) {
          // Update the registration with the payment proof URL
          await updatePaymentProof(registrationId, paymentProofUrl);
          
          toast({
            title: "Payment proof uploaded",
            description: "Your payment screenshot has been uploaded successfully.",
          });
        }
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUploadScreenshot = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmPurchase = async () => {
    if ((paymentMethod === "telebirr" || paymentMethod === "cbebirr") && !screenshot) {
      toast({
        title: "Screenshot required",
        description: "Please upload your payment confirmation screenshot.",
        variant: "destructive"
      });
      return;
    }

    setPaymentComplete(true);
    
    toast({
      title: "Registration confirmed",
      description: `Your ${paymentMethod} payment for ${paymentDetails.description} has been recorded. An admin will review your submission.`,
    });
    
    setTimeout(() => {
      navigate('/events');
    }, 3000);
  };

  const getQRValue = () => {
    return `EMG-PAY-${paymentDetails.eventId}-${paymentDetails.amount}-${Date.now()}`;
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle size={80} className="text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Payment Submitted</h1>
          <p className="text-gray-600">
            Thank you for your registration. Your payment proof has been submitted and will be reviewed by our team.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the events page in a moment...
          </p>
        </div>
      </div>
    );
  }

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
          
          {/* Add discount code section */}
          <div className="mb-4">
            <div className="flex gap-2 justify-center">
              <Input
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="max-w-[200px]"
              />
              <Button 
                onClick={handleDiscountCodeSubmit}
                disabled={isValidating || !discountCode.trim()}
              >
                {isValidating ? "Validating..." : "Apply"}
              </Button>
            </div>
          </div>

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
                    disabled={uploading}
                  >
                    <Upload size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleUploadScreenshot}
                  className="w-full border-2 border-dashed border-gray-300 py-12 rounded flex flex-col items-center justify-center space-y-2 hover:border-emerge-gold transition-colors"
                  disabled={uploading}
                >
                  <Camera size={32} className="text-gray-400" />
                  <span className="text-gray-600">
                    {uploading ? "Uploading..." : "Upload Payment Screenshot"}
                  </span>
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

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">Payment Instructions</h3>
              {paymentMethod === "telebirr" && (
                <ol className="list-decimal text-sm text-yellow-700 pl-5 space-y-1">
                  <li>Open your TeleBirr app</li>
                  <li>Select "Pay Merchant"</li>
                  <li>Scan the QR code above or enter merchant code: <strong>EID0001</strong></li>
                  <li>Enter the exact amount: <strong>ETB {paymentDetails.amount}</strong></li>
                  <li>Complete payment and take a screenshot of the confirmation</li>
                  <li>Upload the screenshot above</li>
                </ol>
              )}
              {paymentMethod === "cbebirr" && (
                <ol className="list-decimal text-sm text-yellow-700 pl-5 space-y-1">
                  <li>Open your CBE Birr app</li>
                  <li>Select "Pay to Merchant"</li>
                  <li>Enter merchant code: <strong>0919876543</strong></li>
                  <li>Enter the exact amount: <strong>ETB {paymentDetails.amount}</strong></li>
                  <li>Complete payment and take a screenshot of the confirmation</li>
                  <li>Upload the screenshot above</li>
                </ol>
              )}
            </div>

            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold disabled:bg-gray-400"
              disabled={uploading}
            >
              {uploading ? "UPLOADING..." : "CONFIRM PURCHASE"}
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
