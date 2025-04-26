import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useToast } from "../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [rememberInfo, setRememberInfo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load saved preferences if they exist
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.country) setCountry(preferences.country);
        if (preferences.city) setCity(preferences.city);
        if (preferences.language) setSelectedLanguage(preferences.language);
        setRememberInfo(true);
      }
    } catch (error) {
      console.error("Error loading saved preferences:", error);
    }
  }, []);

  const languages = [
    "English", // English is now explicitly first
    "Amharic", 
    "Arabic", 
    "Chinese", 
    "French", 
    "German", 
    "Japanese", 
    "Portuguese", 
    "Spanish", 
    "Swahili"
  ];

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleContinueWithoutAccount = () => {
    if (rememberInfo) {
      localStorage.setItem('userPreferences', JSON.stringify({
        country: country.trim() || null,
        city: city.trim() || null,
        language: selectedLanguage
      }));
    } else {
      // If remember info is unchecked, clear any existing preferences
      localStorage.removeItem('userPreferences');
    }
    
    navigate("/home");
  };

  const handleEmailContinue = () => {
    if (rememberInfo) {
      localStorage.setItem('userPreferences', JSON.stringify({
        country: country.trim() || null,
        city: city.trim() || null,
        language: selectedLanguage
      }));
    }
    
    navigate("/email-login");
  };

  const handlePhoneContinue = () => {
    toast({
      title: "Coming Soon",
      description: "Phone authentication will be available soon.",
    });
  };

  const handleGoogleContinue = () => {
    toast({
      title: "Coming Soon",
      description: "Google authentication will be available soon.",
    });
  };

  const handleAppleContinue = () => {
    toast({
      title: "Coming Soon",
      description: "Apple authentication will be available soon.",
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <Logo className="mx-auto mb-2" />
        </div>

        <div className="mb-8 space-y-6">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="bg-transparent border-b border-emerge-gold/50 rounded-none px-0 focus:ring-0 hover:border-emerge-gold/80 transition-colors">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-emerge-gold/50">
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              {/* Add more countries as needed */}
            </SelectContent>
          </Select>

          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-transparent border-b border-emerge-gold/50 rounded-none px-0 focus:ring-0 hover:border-emerge-gold/80 transition-colors">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-emerge-gold/50">
              <SelectItem value="ny">New York</SelectItem>
              <SelectItem value="la">Los Angeles</SelectItem>
              <SelectItem value="ch">Chicago</SelectItem>
              {/* Add more cities as needed */}
            </SelectContent>
          </Select>
        </div>

        <p className="text-center text-xl mb-8 font-light">Log in or sign up to continue</p>

        <div className="space-y-4">
          <Button 
            onClick={handleEmailContinue}
            className="w-full bg-gradient-to-b from-white/90 to-white/70 text-black hover:from-white hover:to-white/80 transition-all duration-200"
            variant="outline"
          >
            Continue with Email
          </Button>
          
          <Button 
            onClick={handlePhoneContinue}
            className="w-full bg-gradient-to-b from-white/90 to-white/70 text-black hover:from-white hover:to-white/80 transition-all duration-200"
            variant="outline"
          >
            Continue with Phone
          </Button>
          
          <Button 
            onClick={handleGoogleContinue}
            className="w-full bg-gradient-to-b from-white/90 to-white/70 text-black hover:from-white hover:to-white/80 transition-all duration-200"
            variant="outline"
          >
            Continue with Google
          </Button>
          
          <Button 
            onClick={handleAppleContinue}
            className="w-full bg-gradient-to-b from-white/90 to-white/70 text-black hover:from-white hover:to-white/80 transition-all duration-200"
            variant="outline"
          >
            Continue with Apple
          </Button>
        </div>

        <div className="mt-8 flex items-start space-x-3">
          <Checkbox
            id="remember"
            checked={rememberInfo}
            onCheckedChange={(checked) => setRememberInfo(checked as boolean)}
            className="border-emerge-gold/50 data-[state=checked]:bg-emerge-gold/30 data-[state=checked]:border-emerge-gold"
          />
          <label
            htmlFor="remember"
            className="text-gray-300 text-sm leading-none pt-0.5"
          >
            Save my information on this device (no payment data saved)
          </label>
        </div>

        <button 
          onClick={handleContinueWithoutAccount}
          className="w-full text-emerge-gold hover:text-emerge-darkGold text-center mt-8"
        >
          Continue without account
        </button>
      </div>
    </div>
  );
};

export default Login;
