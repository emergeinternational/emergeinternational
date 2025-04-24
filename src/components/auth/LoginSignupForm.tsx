
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const { toast } = useToast();
  const { signIn } = useAuth();

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

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`
          }
        });
        if (error) throw error;
        
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      {isLogin && (
        <div className="text-right">
          <button 
            type="button"
            onClick={onForgotPassword}
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
        {isSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
      </button>

      <div className="mt-8 text-center">
        <button 
          type="button"
          onClick={onToggleMode} 
          className="text-emerge-gold hover:underline"
          disabled={isSubmitting}
        >
          {isLogin 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Sign In"}
        </button>
      </div>
    </form>
  );
};
