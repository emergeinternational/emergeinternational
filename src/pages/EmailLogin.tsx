
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // If we're in forgot password mode, handle password reset
    if (isForgotPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/profile",
        });
        
        if (error) throw error;
        
        setResetSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for a password reset link."
        });
      } catch (error) {
        toast({
          title: "Error sending reset email",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password.trim() && !isForgotPassword) {
      toast({
        title: "Password is required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
        // Navigate is handled by onAuthStateChange in useAuth.tsx
      } else {
        await signUp(email, password);
        toast({
          title: "Account created",
          description: "Please complete your profile.",
        });
        // For signups, explicitly navigate to profile since the session might not be immediately available
        navigate("/profile");
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    if (isForgotPassword) {
      setIsForgotPassword(false);
      setResetSent(false);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-emerge-darkBg text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button onClick={handleBackClick} className="flex items-center text-emerge-gold hover:text-emerge-darkGold">
            <ArrowLeft size={18} className="mr-2" />
            <span>{isForgotPassword ? "Back to Login" : "Back"}</span>
          </button>
        </div>

        <div className="mb-12 text-center">
          <Logo className="mx-auto mb-2" />
          <h2 className="text-2xl font-serif mt-6">
            {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        {resetSent ? (
          <div className="text-center space-y-4">
            <p>Check your email for a password reset link.</p>
            <button
              onClick={() => setIsForgotPassword(false)}
              className="emerge-button-primary w-full"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-300 text-sm">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="emerge-input"
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <label htmlFor="password" className="block text-gray-300 text-sm">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="emerge-input"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-emerge-gold text-sm hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="emerge-button-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? "Please wait..." 
                : isForgotPassword 
                  ? "Send Reset Link" 
                  : isLogin 
                    ? "Sign In" 
                    : "Create Account"
              }
            </button>
          </form>
        )}

        {!isForgotPassword && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-emerge-gold hover:underline"
              disabled={isSubmitting}
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailLogin;
