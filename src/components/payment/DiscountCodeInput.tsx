
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DiscountCodeInputProps {
  discountCode: string;
  onDiscountCodeChange: (code: string) => void;
  onApplyDiscount: () => void;
  isValidating: boolean;
}

export const DiscountCodeInput = ({
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  isValidating
}: DiscountCodeInputProps) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2 justify-center">
        <Input
          type="text"
          placeholder="Enter discount code"
          value={discountCode}
          onChange={(e) => onDiscountCodeChange(e.target.value)}
          className="max-w-[200px]"
        />
        <Button 
          onClick={onApplyDiscount}
          disabled={isValidating || !discountCode.trim()}
        >
          {isValidating ? "Validating..." : "Apply"}
        </Button>
      </div>
    </div>
  );
};
