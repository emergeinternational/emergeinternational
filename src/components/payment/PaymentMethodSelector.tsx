
import React from 'react';

interface PaymentMethodSelectorProps {
  paymentMethod: "telebirr" | "card" | "cbebirr";
  onMethodChange: (method: "telebirr" | "card" | "cbebirr") => void;
}

export const PaymentMethodSelector = ({ paymentMethod, onMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="flex mb-8">
      <button 
        onClick={() => onMethodChange("telebirr")}
        className={`flex-1 py-3 text-center ${
          paymentMethod === "telebirr" 
            ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
            : "bg-white text-gray-500"
        }`}
      >
        TeleBirr
      </button>
      <button 
        onClick={() => onMethodChange("cbebirr")}
        className={`flex-1 py-3 text-center ${
          paymentMethod === "cbebirr" 
            ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
            : "bg-white text-gray-500"
        }`}
      >
        CBEBirr
      </button>
      <button 
        onClick={() => onMethodChange("card")}
        className={`flex-1 py-3 text-center ${
          paymentMethod === "card" 
            ? "bg-emerge-cream text-black border-b-2 border-emerge-gold" 
            : "bg-white text-gray-500"
        }`}
      >
        Card
      </button>
    </div>
  );
};
