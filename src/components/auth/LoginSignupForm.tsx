
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LoginSignupFormProps {
  isLogin: boolean;
  isSubmitting: boolean;
  onForgotPassword: () => void;
  onToggleMode: () => void;
}

export const LoginSignupForm: React.FC<LoginSignupFormProps> = ({
  isLogin,
  isSubmitting: parentIsSubmitting,
  onForgotPassword,
  onToggleMode,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!password) {
      toast({
        title: "Password is required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return false;
    }

    if (!isLogin && password.length < 6) {
      toast({
        title: "Password is too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || parentIsSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        // Sign up with retry logic for database issues
        let retryCount = 0;
        const maxRetries = 3;
        let success = false;

        while (!success && retryCount < maxRetries) {
          try {
            await signUp(email, password);
            success = true;
          } catch (error: any) {
            console.error(`Signup attempt ${retryCount + 1} failed:`, error);
            
            // If it's a database error, retry
            if (error.message && (
                error.message.includes("database") || 
                error.message.includes("Database") ||
                error.message.includes("type") ||
                error.message.includes("foreign key") ||
                error.message.includes("constraint")
              )) {
              retryCount++;
              if (retryCount < maxRetries) {
                console.log(`Retrying signup (attempt ${retryCount + 1}/${maxRetries})...`);
                // Wait a bit before retrying with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                continue;
              }
            }
            
            // If we've reached max retries or it's not a database error, throw
            throw error;
          }
        }

        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      
      let errorMessage = "An error occurred during authentication.";
      
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account before logging in.";
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("database") || error.message.includes("Database")) {
          errorMessage = "There was a problem with our database. Please try again in a few moments.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: isLogin ? "Login failed" : "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={isSubmitting || parentIsSubmitting}
        />
      </div>

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
          placeholder="Enter your password"
          disabled={isSubmitting || parentIsSubmitting}
        />
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-gray-300 text-sm">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="emerge-input"
            placeholder="Confirm your password"
            disabled={isSubmitting || parentIsSubmitting}
          />
        </div>
      )}

      <div className="flex justify-end">
        {isLogin && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-emerge-gold hover:text-emerge-darkGold text-sm"
            disabled={isSubmitting || parentIsSubmitting}
          >
            Forgot Password?
          </button>
        )}
      </div>

      <button
        type="submit"
        className="emerge-button-primary w-full"
        disabled={isSubmitting || parentIsSubmitting}
      >
        {isSubmitting || parentIsSubmitting
          ? isLogin
            ? "Logging In..."
            : "Creating Account..."
          : isLogin
          ? "Log In"
          : "Create Account"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-emerge-gold hover:text-emerge-darkGold"
          disabled={isSubmitting || parentIsSubmitting}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </button>
      </div>
    </form>
  );
};
