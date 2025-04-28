import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OTPVerification } from "./OTPVerification";

interface LoginSignupFormProps {
  isLogin: boolean;
  isSubmitting: boolean;
  onForgotPassword: () => void;
  onToggleMode: () => void;
}

export const LoginSignupForm = ({
  isLogin,
  isSubmitting,
  onForgotPassword,
  onToggleMode,
}: LoginSignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Password is required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        // Implement exponential backoff for signup attempts
        let success = false;
        let attempts = 0;
        const maxAttempts = 5; // Increased attempts for more reliability
        let delayMs = 500; // Start with 500ms delay
        
        while (!success && attempts < maxAttempts) {
          attempts++;
          try {
            await signUp(email, password);
            success = true;
            
            toast({
              title: "Account created",
              description: "Please check your email to confirm your account.",
            });
            
            break;
          } catch (retryError) {
            console.log(`Signup attempt ${attempts} failed:`, retryError);
            
            // Detect database-related errors
            if (retryError instanceof Error && 
                (retryError.message.includes("database") || 
                 retryError.message.includes("foreign key") ||
                 retryError.message.includes("type") ||
                 retryError.message.includes("violates"))) {
              
              // For database errors, longer delay with more randomness to avoid thundering herd
              delayMs = Math.floor(delayMs * 1.5 + Math.random() * 500);
              
              if (attempts < maxAttempts) {
                console.log(`Database error, retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
              } else {
                throw new Error("Registration service is temporarily unavailable. Please try again in a few minutes.");
              }
            } else {
              // For non-database errors, just throw them as-is
              throw retryError;
            }
          }
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      
      if (errorMessage.toLowerCase().includes("database error") || 
          errorMessage.toLowerCase().includes("violates foreign key")) {
        toast({
          title: "Registration issue",
          description: "There was a problem with our database. Please try again in a few moments.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("already registered") || 
                errorMessage.toLowerCase().includes("already taken")) {
        toast({
          title: "Email already registered",
          description: "This email is already in use. Please try logging in instead.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("invalid login")) {
        toast({
          title: "Invalid login",
          description: "Incorrect email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOTPVerificationSuccess = () => {
    setShowOTPDialog(false);
    toast({
      title: "Verification successful",
      description: "You can now set a new password.",
    });
  };

  const isInProgress = isSubmitting || isProcessing;

  return (
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
          disabled={isInProgress}
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
          placeholder="••••••••"
          disabled={isInProgress}
        />
      </div>

      {isLogin && (
        <div className="flex justify-between items-center text-sm">
          <button 
            type="button"
            onClick={onForgotPassword}
            className="text-emerge-gold hover:underline"
            disabled={isInProgress}
          >
            Reset via Email
          </button>
          
          <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
            <DialogTrigger asChild>
              <button 
                type="button"
                className="text-emerge-gold hover:underline"
                disabled={isInProgress}
              >
                Reset via OTP
              </button>
            </DialogTrigger>
            <DialogContent className="bg-emerge-darkBg border border-emerge-gold/50">
              <DialogHeader>
                <DialogTitle className="text-white">Reset Password with OTP</DialogTitle>
              </DialogHeader>
              <OTPVerification
                email={email}
                isSubmitting={isInProgress}
                onVerificationSuccess={handleOTPVerificationSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      <button 
        type="submit" 
        className="emerge-button-primary w-full"
        disabled={isInProgress}
      >
        {isInProgress ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
      </button>

      <div className="mt-8 text-center">
        <button 
          type="button"
          onClick={onToggleMode} 
          className="text-emerge-gold hover:underline"
          disabled={isInProgress}
        >
          {isLogin 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Sign In"}
        </button>
      </div>
    </form>
  );
};
