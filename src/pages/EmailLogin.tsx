import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { LoginSignupForm } from "@/components/auth/LoginSignupForm";
import { usePageTitle } from "../utils/usePageTitle";

const EmailLogin = () => {
  usePageTitle();
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isResetLinkSent, setIsResetLinkSent] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    console.log("URL search params:", searchParams.toString());
    console.log("URL hash:", hash);
    
    const isRecovery = 
      (hash && hash.includes('type=recovery')) || 
      searchParams.has('type') && searchParams.get('type') === 'recovery';
    
    if (isRecovery) {
      console.log("Password recovery mode detected");
      setIsRecoveryMode(true);
      setIsForgotPassword(true);
    }
  }, []);

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
      const origin = window.location.origin;
      const redirectTo = `${origin}/email-login`;
      
      console.log("Password reset redirect URL:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });
      
      if (error) throw error;
      
      setIsResetLinkSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      toast({
        title: "Error sending reset link",
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
      setIsResetLinkSent(false);
    } else {
      navigate("/login");
    }
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    setIsForgotPassword(true);
  };

  const handleResetSuccess = () => {
    toast({
      title: "Password reset successful",
      description: "You can now log in with your new password",
    });
    setIsForgotPassword(false);
    setShowOTP(false);
    setEmail("");
    navigate("/login");
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
                ? (isResetLinkSent ? "Check Your Email" : isRecoveryMode ? "Set New Password" : "Reset Password") 
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
          isRecoveryMode ? (
            <PasswordResetForm
              isSubmitting={isSubmitting}
              onResetSuccess={handleResetSuccess}
            />
          ) : isResetLinkSent ? (
            <div className="text-center">
              <p className="mb-4">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <p className="mb-4">
                Click the link in the email to reset your password.
              </p>
              <p className="text-sm text-gray-400">
                If you don't see the email, check your spam folder.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-300 text-sm">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="emerge-input"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
              <button 
                onClick={handleForgotPassword}
                className="emerge-button-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          )
        ) : (
          <LoginSignupForm
            isLogin={isLogin}
            isSubmitting={isSubmitting}
            onForgotPassword={() => {
              setIsForgotPassword(true);
            }}
            onToggleMode={() => setIsLogin(!isLogin)}
          />
        )}
      </div>
    </div>
  );
};

export default EmailLogin;
