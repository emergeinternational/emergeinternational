
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Edit, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  merchant_code: z.string().optional(),
  instructions: z.string().min(1, 'Instructions are required'),
});

interface PaymentInstruction {
  id: string;
  payment_method: string;
  instructions: string;
  merchant_code: string | null;
}

export function PaymentInstructionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMethod, setEditingMethod] = React.useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { data: instructions, isLoading } = useQuery({
    queryKey: ['paymentInstructions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_instructions')
        .select('*');
      
      if (error) throw error;
      return data as PaymentInstruction[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ 
      payment_method, 
      merchant_code, 
      instructions 
    }: { 
      payment_method: string; 
      merchant_code?: string; 
      instructions: string; 
    }) => {
      const { error } = await supabase
        .from('payment_instructions')
        .update({ merchant_code, instructions })
        .eq('payment_method', payment_method);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentInstructions'] });
      toast({
        title: "Success",
        description: "Payment instructions updated successfully",
      });
      setEditingMethod(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update payment instructions",
        variant: "destructive",
      });
    },
  });

  const startEditing = (instruction: PaymentInstruction) => {
    setEditingMethod(instruction.payment_method);
    form.reset({
      merchant_code: instruction.merchant_code || '',
      instructions: instruction.instructions,
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingMethod) return;
    
    // Make sure instructions is always provided as non-optional
    await updateMutation.mutate({
      payment_method: editingMethod,
      merchant_code: values.merchant_code,
      instructions: values.instructions
    });
  };

  if (isLoading) {
    return <div>Loading payment instructions...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Payment Instructions</h2>
      
      {instructions?.map((instruction) => (
        <div key={instruction.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium capitalize">
              {instruction.payment_method}
            </h3>
            {editingMethod !== instruction.payment_method ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEditing(instruction)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingMethod(null)}
              >
                Cancel
              </Button>
            )}
          </div>

          {editingMethod === instruction.payment_method ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="merchant_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merchant Code</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Enter merchant code (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={5}
                          placeholder="Enter payment instructions here..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-2">
              {instruction.merchant_code && (
                <p className="text-sm text-gray-500">
                  <strong>Merchant Code:</strong> {instruction.merchant_code}
                </p>
              )}
              <div className="text-sm text-gray-500">
                <strong>Instructions:</strong>
                <pre className="mt-1 whitespace-pre-wrap font-sans">
                  {instruction.instructions}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
