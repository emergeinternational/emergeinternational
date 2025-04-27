
import React from 'react';

interface PaymentInstructionsProps {
  paymentMethod: "telebirr" | "card" | "cbebirr";
  amount: number;
}

export const PaymentInstructions = ({ paymentMethod, amount }: PaymentInstructionsProps) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
      <h3 className="font-medium text-yellow-800 mb-2">Payment Instructions</h3>
      {paymentMethod === "telebirr" && (
        <ol className="list-decimal text-sm text-yellow-700 pl-5 space-y-1">
          <li>Open your TeleBirr app</li>
          <li>Select "Pay Merchant"</li>
          <li>Scan the QR code above or enter merchant code: <strong>EID0001</strong></li>
          <li>Enter the exact amount: <strong>ETB {amount}</strong></li>
          <li>Complete payment and take a screenshot of the confirmation</li>
          <li>Upload the screenshot above</li>
        </ol>
      )}
      {paymentMethod === "cbebirr" && (
        <ol className="list-decimal text-sm text-yellow-700 pl-5 space-y-1">
          <li>Open your CBE Birr app</li>
          <li>Select "Pay to Merchant"</li>
          <li>Enter merchant code: <strong>0919876543</strong></li>
          <li>Enter the exact amount: <strong>ETB {amount}</strong></li>
          <li>Complete payment and take a screenshot of the confirmation</li>
          <li>Upload the screenshot above</li>
        </ol>
      )}
    </div>
  );
};
