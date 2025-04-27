
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface PaymentInstructionsProps {
  paymentMethod: "telebirr" | "card" | "cbebirr";
  amount: number;
}

interface PaymentInstruction {
  id: string;
  payment_method: string;
  instructions: string;
  merchant_code: string;
}

export const PaymentInstructions = ({ paymentMethod, amount }: PaymentInstructionsProps) => {
  const { data: instructions } = useQuery({
    queryKey: ['paymentInstructions', paymentMethod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_instructions')
        .select('*')
        .eq('payment_method', paymentMethod)
        .single();
      
      if (error) throw error;
      return data as PaymentInstruction;
    }
  });

  if (!instructions) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
      <h3 className="font-medium text-yellow-800 mb-2">Payment Instructions</h3>
      <ol className="list-decimal text-sm text-yellow-700 pl-5 space-y-1">
        {instructions.instructions.split('\n').map((instruction, index) => {
          // Replace placeholders with actual values
          const processedInstruction = instruction
            .replace('[MERCHANT_CODE]', instructions.merchant_code)
            .replace('[AMOUNT]', `ETB ${amount}`);
          
          return <li key={index}>{processedInstruction}</li>;
        })}
      </ol>
    </div>
  );
};
