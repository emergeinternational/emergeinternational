
import { PaymentMethod } from "@/services/paymentService";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string | null;
  onMethodChange: (method: string) => void;
}

export const PaymentMethodSelector = ({ 
  paymentMethods, 
  selectedMethod, 
  onMethodChange 
}: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Method</h3>
      
      {paymentMethods.length === 0 ? (
        <div className="text-gray-500 italic">No payment methods available</div>
      ) : (
        <RadioGroup
          value={selectedMethod || ''}
          onValueChange={onMethodChange}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              className={`flex items-start p-4 rounded-lg border ${
                selectedMethod === method.id
                  ? "border-emerge-gold bg-amber-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem
                value={method.id}
                id={`payment-${method.id}`}
                className="mt-1"
              />
              <div className="ml-3">
                <label
                  htmlFor={`payment-${method.id}`}
                  className="font-medium cursor-pointer"
                >
                  {method.name}
                </label>
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                {method.requires_verification && (
                  <div className="mt-2 text-xs text-amber-600">
                    Payment verification required
                  </div>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );
};
