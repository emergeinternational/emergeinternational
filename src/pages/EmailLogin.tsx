
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { LoginSignupForm } from "@/components/auth/LoginSignupForm";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/email-login`
      });
      
      if (error) throw error;
      
      setShowOTP(true);
      toast({
        title: "Code sent",
        description: "Check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Error sending code",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    if (showOTP) {
      setShowOTP(false);
      setIsForgotPassword(false);
    } else if (isForgotPassword) {
      setIsForgotPassword(false);
    } else {
      navigate("/login");
    }
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    setIsForgotPassword(true);
  };

  const handleResetSuccess = () => {
    setIsForgotPassword(false);
    setShowOTP(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-emerge-darkBg text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button onClick={handleBackClick} className="flex items-center text-emerge-gold hover:text-emerge-darkGold">
            <ArrowLeft size={18} className="mr-2" />
            <span>{showOTP ? "Back to Email" : isForgotPassword ? "Back to Login" : "Back"}</span>
          </button>
        </div>

        <div className="mb-12 text-center">
          <Logo className="mx-auto mb-2" />
          <h2 className="text-2xl font-serif mt-6">
            {showOTP 
              ? "Enter Verification Code" 
              : isForgotPassword 
                ? "Set New Password" 
                : isLogin 
                  ? "Welcome Back" 
                  : "Create Account"}
          </h2>
        </div>

        {showOTP ? (
          <OTPVerification
            email={email}
            isSubmitting={isSubmitting}
            onVerificationSuccess={handleOTPSuccess}
          />
        ) : isForgotPassword ? (
          <PasswordResetForm
            isSubmitting={isSubmitting}
            onResetSuccess={handleResetSuccess}
          />
        ) : (
          <LoginSignupForm
            isLogin={isLogin}
            isSubmitting={isSubmitting}
            onForgotPassword={() => {
              setIsForgotPassword(true);
              handleForgotPassword();
            }}
            onToggleMode={() => setIsLogin(!isLogin)}
          />
        )}
      </div>
    </div>
  );
};

export default EmailLogin;
