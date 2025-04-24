
import { useState } from "react";
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
  const { toast } = useToast();

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
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <button 
        onClick={handleVerifyOTP}
        className="emerge-button-primary w-full"
        disabled={isSubmitting || otp.length !== 6}
      >
        {isSubmitting ? "Verifying..." : "Verify Code"}
      </button>
    </div>
  );
};
