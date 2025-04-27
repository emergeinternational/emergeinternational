
import React, { useCallback } from 'react';
import { useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Trash } from "lucide-react";

interface TicketTypeFormFieldsProps {
  form: any;
  isEditMode: boolean;
}

const defaultBenefits = ["Event Access", "Networking", "Certificate"];

const BenefitFields = ({ form, ticketIndex }: { form: any; ticketIndex: number }) => {
  const { 
    fields: benefitFields, 
    append: appendBenefit, 
    remove: removeBenefit 
  } = useFieldArray({
    control: form.control,
    name: `ticket_types.${ticketIndex}.benefits`
  });
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <FormLabel>Benefits (Display Only)</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendBenefit("")}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Benefit
        </Button>
      </div>
      
      {benefitFields.length > 0 ? (
        <div className="space-y-2">
          {benefitFields.map((benefitField, benefitIndex) => (
            <div key={benefitField.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`ticket_types.${ticketIndex}.benefits.${benefitIndex}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="e.g., VIP Access, Free Drinks, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBenefit(benefitIndex)}
                className="text-red-500"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No benefits added yet</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        Note: Benefits are for display purposes only and aren't stored in the database.
      </p>
    </div>
  );
};

const TicketTypeFormFields: React.FC<TicketTypeFormFieldsProps> = ({ form, isEditMode }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ticket_types"
  });
  
  const addTicketType = useCallback(() => {
    append({ 
      name: "", 
      price: 0, 
      description: "", 
      quantity: 1,
      benefits: [...defaultBenefits]
    });
  }, [append]);

  return (
    <div className="border-t mt-6 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ticket Types</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTicketType}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-md p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Ticket Type {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <FormField
              control={form.control}
              name={`ticket_types.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ticket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`ticket_types.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price*</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name={`ticket_types.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ticket description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`ticket_types.${index}.quantity`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Quantity*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <BenefitFields form={form} ticketIndex={index} />
        </div>
      ))}

      {fields.length === 0 && (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No ticket types added yet</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={addTicketType}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketTypeFormFields;
