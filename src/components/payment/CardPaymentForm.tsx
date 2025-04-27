
import React from 'react';

export const CardPaymentForm = () => {
  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md bg-white shadow-sm">
        <h3 className="font-medium mb-2">Credit/Debit Card</h3>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Card Number" 
            className="emerge-input" 
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="MM/YY" 
              className="emerge-input" 
            />
            <input 
              type="text" 
              placeholder="CVC" 
              className="emerge-input" 
            />
          </div>
          <input 
            type="text" 
            placeholder="Cardholder Name" 
            className="emerge-input" 
          />
        </div>
      </div>
    </div>
  );
};
