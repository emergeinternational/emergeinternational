
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useToast } from "../hooks/use-toast";

const Login = () => {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [rememberInfo, setRememberInfo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const languages = ["English", "Amharic", "French", "Swahili"];

  const handleContinueWithoutAccount = () => {
    if (rememberInfo && country.trim()) {
      // Store user preferences if remember is checked and country is provided
      localStorage.setItem('userPreferences', JSON.stringify({
        country,
        city,
        language: selectedLanguage
      }));
    }
    
    toast({
      title: "Continuing as guest",
      description: "You can create an account later to save your details.",
    });
    navigate("/shop");
  };

  const handleEmailContinue = () => {
    if (!country.trim()) {
      toast({
        title: "Country is required",
        description: "Please enter your country before continuing.",
        variant: "destructive",
      });
      return;
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
    <div className="min-h-screen bg-emerge-darkBg text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <Logo className="mx-auto mb-2" />
        </div>

        <div className="mb-8 space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="emerge-input"
            />
          </div>

          <div className="relative space-y-2">
            <div
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="emerge-input flex justify-between items-center cursor-pointer"
            >
              <span>{selectedLanguage}</span>
              <span>▼</span>
            </div>
            {showLanguageDropdown && (
              <div className="absolute top-full left-0 right-0 bg-emerge-darkBg border border-emerge-gold/50 z-10">
                {languages.map((lang) => (
                  <div
                    key={lang}
                    className="p-2 hover:bg-black/20 cursor-pointer"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="emerge-input"
            />
          </div>
        </div>

        <p className="text-center text-lg mb-6">Log in or sign up to continue</p>

        <div className="space-y-4">
          <button 
            onClick={handleEmailContinue}
            className="emerge-button-secondary w-full"
          >
            Continue with Email
          </button>
          
          <button 
            onClick={handlePhoneContinue}
            className="emerge-button-secondary w-full"
          >
            Continue with Phone
          </button>
          
          <button 
            onClick={handleGoogleContinue}
            className="emerge-button-secondary w-full"
          >
            Continue with Google
          </button>
          
          <button 
            onClick={handleAppleContinue}
            className="emerge-button-secondary w-full"
          >
            Continue with Apple
          </button>
        </div>

        <div className="mt-8 flex items-start space-x-3">
          <div 
            onClick={() => setRememberInfo(!rememberInfo)}
            className={`w-5 h-5 border border-emerge-gold/50 flex items-center justify-center cursor-pointer ${rememberInfo ? 'bg-emerge-gold/30' : ''}`}
          >
            {rememberInfo && <span>✓</span>}
          </div>
          <p className="text-gray-300 text-sm">
            Save my information on this device (no payment data saved)
          </p>
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
