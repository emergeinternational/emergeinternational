
import { formatCurrency, Currency } from "@/services/currencyService";

interface PaymentSummaryProps {
  ticketType: string;
  ticketPrice: number;
  quantity: number;
  discountPercent?: number;
  discountAmount?: number;
  selectedCurrency: Currency;
  currencies: Currency[];
  fees?: number;
}

export const PaymentSummary = ({
  ticketType,
  ticketPrice,
  quantity,
  discountPercent,
  discountAmount,
  selectedCurrency,
  currencies,
  fees = 0
}: PaymentSummaryProps) => {
  // Calculate subtotal
  const subtotal = ticketPrice * quantity;
  
  // Calculate discount
  let discountValue = 0;
  if (discountPercent) {
    discountValue = subtotal * (discountPercent / 100);
  } else if (discountAmount) {
    discountValue = discountAmount;
  }
  
  // Calculate total
  const total = subtotal - discountValue + fees;
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-lg mb-4">Payment Summary</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>
            {ticketType} x {quantity}
          </span>
          <span>
            {formatCurrency(subtotal, selectedCurrency.code, currencies)}
          </span>
        </div>
        
        {discountValue > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(discountValue, selectedCurrency.code, currencies)}</span>
          </div>
        )}
        
        {fees > 0 && (
          <div className="flex justify-between">
            <span>Processing fee</span>
            <span>{formatCurrency(fees, selectedCurrency.code, currencies)}</span>
          </div>
        )}
        
        <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total, selectedCurrency.code, currencies)}</span>
        </div>
      </div>
    </div>
  );
};
