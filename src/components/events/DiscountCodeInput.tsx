
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyDiscountCode } from "@/services/paymentService";
import { formatCurrency } from "@/services/currencyService";
import { Currency } from "@/services/currencyService";

interface DiscountCodeInputProps {
  eventId: string;
  selectedCurrency: Currency;
  currencies: Currency[];
  baseCurrency: string;
  onApplyDiscount: (percent?: number, amount?: number) => void;
}

export const DiscountCodeInput = ({ 
  eventId,
  selectedCurrency,
  currencies,
  baseCurrency,
  onApplyDiscount
}: DiscountCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [discountInfo, setDiscountInfo] = useState<{
    percent?: number;
    amount?: number;
  } | null>(null);

  const convertAmount = (amount: number): number => {
    if (selectedCurrency.code === baseCurrency) return amount;
    
    const baseRate = currencies.find(c => c.code === baseCurrency)?.exchange_rate || 1;
    const targetRate = selectedCurrency.exchange_rate;
    
    return (amount / baseRate) * targetRate;
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    
    setIsChecking(true);
    setStatus("idle");
    setDiscountInfo(null);
    
    try {
      const result = await verifyDiscountCode(code, eventId);
      
      if (result.valid) {
        setStatus("valid");
        const discountData = {
          percent: result.discountPercent,
          amount: result.discountAmount ? convertAmount(result.discountAmount) : undefined
        };
        setDiscountInfo(discountData);
        onApplyDiscount(result.discountPercent, discountData.amount);
      } else {
        setStatus("invalid");
        onApplyDiscount(undefined, undefined);
      }
    } catch (error) {
      console.error("Error verifying discount code:", error);
      setStatus("invalid");
      onApplyDiscount(undefined, undefined);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setStatus("idle");
    setDiscountInfo(null);
    onApplyDiscount(undefined, undefined);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Discount Code</h3>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter discount code"
            className={status === "valid" ? "pr-8 border-green-500" : status === "invalid" ? "pr-8 border-red-500" : ""}
            disabled={isChecking || status === "valid"}
          />
          {status === "valid" && (
            <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {status === "invalid" && (
            <X className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
          )}
        </div>
        <Button
          type="button"
          variant={status === "valid" ? "outline" : "default"}
          onClick={status === "valid" ? handleClear : handleVerify}
          disabled={isChecking || !code.trim()}
        >
          {status === "valid" ? "Clear" : "Apply"}
        </Button>
      </div>
      
      {status === "valid" && discountInfo && (
        <div className="bg-green-50 p-3 rounded-md text-sm text-green-700">
          {discountInfo.percent ? (
            <p>Discount: {discountInfo.percent}% off</p>
          ) : discountInfo.amount ? (
            <p>Discount: {formatCurrency(discountInfo.amount, selectedCurrency.code, currencies)} off</p>
          ) : null}
        </div>
      )}
      
      {status === "invalid" && (
        <div className="bg-red-50 p-3 rounded-md text-sm text-red-700">
          Invalid or expired discount code.
        </div>
      )}
    </div>
  );
};
