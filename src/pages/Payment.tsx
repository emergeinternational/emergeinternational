import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import Logo from "../components/Logo";
import { QRCodeSVG } from "qrcode.react";
import { saveEventRegistration, updatePaymentProof } from "@/services/workshopService";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentProof } from '@/hooks/usePaymentProof';
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { PaymentInstructions } from "@/components/payment/PaymentInstructions";
import { ScreenshotUploader } from "@/components/payment/ScreenshotUploader";
import { CardPaymentForm } from "@/components/payment/CardPaymentForm";

interface PaymentDetails {
  amount: number;
  description: string;
  eventId: string | null;
  ticketType: string | null;
  discountApplied?: {
    code: string;
    amount: number;
  } | null;
}

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "card" | "cbebirr">("telebirr");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const paymentDetails = location.state as PaymentDetails || {
    amount: 0,
    description: "Payment",
    eventId: null,
    ticketType: null
  };

  const { uploadPaymentProof, isUploading } = usePaymentProof();

  useEffect(() => {
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
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    if (registrationId) {
      try {
        const paymentProofUrl = await uploadPaymentProof(file);
        
        if (paymentProofUrl) {
          await updatePaymentProof(registrationId, paymentProofUrl);
          
          toast({
            title: "Payment proof uploaded",
            description: "Your payment screenshot has been uploaded successfully.",
          });
        }
      } catch (error) {
        console.error("Error updating payment proof:", error);
        toast({
          title: "Upload Error",
          description: "There was an error uploading your payment proof. Please try again.",
          variant: "destructive"
        });
      }
    }
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
            Once approved, you will receive a QR code ticket that can be scanned at the event entrance.
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
          <Link to={`/event-payment/${paymentDetails.eventId}`} className="flex items-center text-black">
            <ArrowLeft size={24} className="mr-2" />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <Logo variant="gold" className="mx-auto mb-2" />
        </div>

        <h1 className="text-3xl font-semibold mb-6">Confirm Your Payment</h1>

        <PaymentMethodSelector 
          paymentMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
        />

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">ETB {paymentDetails.amount}</h2>
          
          {paymentDetails.discountApplied && (
            <div className="bg-emerald-50 p-2 rounded-md inline-block text-sm text-emerald-700 mb-2">
              Discount code <span className="font-medium">{paymentDetails.discountApplied.code}</span> applied
              <span className="text-xs ml-1">(-ETB {paymentDetails.discountApplied.amount.toFixed(2)})</span>
            </div>
          )}
          
          <p className="text-gray-600">
            {paymentDetails.description}<br />
            {paymentMethod === "telebirr" && "Payment requires admin verification"}
            {paymentMethod === "cbebirr" && "Payment requires admin verification"}
            {paymentMethod === "card" && "Payment requires admin verification"}
          </p>
        </div>

        {(paymentMethod === "telebirr" || paymentMethod === "cbebirr") ? (
          <>
            <ScreenshotUploader
              screenshot={screenshot}
              onFileUpload={handleFileUpload}
              uploading={isUploading}
            />

            <div className="border border-gray-300 p-4 rounded flex flex-col items-center space-y-4 mt-6">
              <QRCodeSVG
                value={getQRValue()}
                size={200}
                level="H"
                includeMargin
                className="max-w-full"
              />
              <p className="text-sm text-gray-600">Scan QR Code to Pay</p>
            </div>

            <PaymentInstructions 
              paymentMethod={paymentMethod}
              amount={paymentDetails.amount}
            />

            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold disabled:bg-gray-400 mt-6"
              disabled={isUploading || !screenshot}
            >
              {isUploading ? "UPLOADING..." : "CONFIRM PURCHASE"}
            </button>
          </>
        ) : (
          <>
            <CardPaymentForm />
            <button 
              onClick={handleConfirmPurchase}
              className="w-full bg-black text-white py-4 rounded font-semibold mt-6"
            >
              PAY ETB {paymentDetails.amount}
            </button>
          </>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">Important Note</h3>
          <p className="text-sm text-yellow-700">
            After submitting your payment, an administrator will review and approve it. 
            Once approved, your ticket QR code will be activated for event entry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
