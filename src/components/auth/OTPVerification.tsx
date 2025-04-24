
import { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OTPVerificationProps {
  email: string;
  isSubmitting: boolean;
  onVerificationSuccess: () => void;
}

export const OTPVerification = ({
  email,
  isSubmitting,
  onVerificationSuccess,
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleResendOTP = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/email-login`
      });

      if (error) throw error;
      
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email.",
      });
      
      setCanResend(false);
      setResendCountdown(60);
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: error instanceof Error ? error.message : "Could not resend OTP",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code sent to your email.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      });

      if (error) throw error;
      
      toast({
        title: "Code verified",
        description: "Please enter your new password.",
      });
      onVerificationSuccess();
    } catch (error) {
      toast({
        title: "Verification error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-center text-sm text-gray-300 mb-4">
          Enter the 6-digit code sent to {email}
        </p>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          className="gap-2"
          disabled={isSubmitting}
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <button 
          type="button"
          onClick={handleResendOTP}
          disabled={!canResend || isSubmitting}
          className={`text-emerge-gold ${canResend ? 'hover:underline' : 'opacity-50'}`}
        >
          {canResend ? "Resend Code" : `Resend in ${resendCountdown}s`}
        </button>
      </div>

      <button 
        onClick={handleVerifyOTP}
        className="emerge-button-primary w-full"
        disabled={isSubmitting || otp.length !== 6}
      >
        {isSubmitting ? "Verifying..." : "Verify Code"}
      </button>
      
      <div className="mt-4 text-center text-xs text-gray-400">
        <p>Didn't receive the code? Check your spam folder.</p>
        <p>If the problem persists, try requesting a new code or contact support.</p>
      </div>
    </div>
  );
};
