
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
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

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        toast({
          title: "Success",
          description: "Account created! Please complete your profile.",
        });
        navigate("/profile");
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
    <div className="min-h-screen bg-emerge-darkBg text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/login" className="flex items-center text-emerge-gold hover:text-emerge-darkGold">
            <ArrowLeft size={18} className="mr-2" />
            <span>Back</span>
          </Link>
        </div>

        <div className="mb-12 text-center">
          <Logo className="mx-auto mb-2" />
          <h2 className="text-2xl font-serif mt-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

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
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-emerge-gold text-sm hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <button type="submit" className="emerge-button-primary w-full">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-emerge-gold hover:underline"
          >
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;
