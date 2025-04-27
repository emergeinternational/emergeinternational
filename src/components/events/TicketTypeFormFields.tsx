
import React from 'react';
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

const TicketTypeFormFields: React.FC<TicketTypeFormFieldsProps> = ({ form, isEditMode }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ticket_types"
  });

  // Create an array of field arrays for each ticket type's benefits
  // The key here is we're not using hooks inside a loop or condition
  const benefitsFieldArrays = fields.map((field, index) => {
    const key = `benefits-${field.id}`;
    return {
      index,
      fieldId: field.id,
      key
    };
  });

  // Create all the field arrays for benefits up front, outside of the render loop
  const benefitsControls = benefitsFieldArrays.map(benefitField => {
    return useFieldArray({
      control: form.control,
      name: `ticket_types.${benefitField.index}.benefits`
    });
  });

  return (
    <div className="border-t mt-6 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ticket Types</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ 
            name: "", 
            price: 0, 
            description: "", 
            quantity: 1,
            benefits: []
          })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
        </Button>
      </div>

      {fields.map((field, index) => {
        // Find the matching benefits control
        const benefitsControl = benefitsControls[index];
        
        return (
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
            
            {/* Benefits Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Benefits</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => benefitsControl.append("")}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Benefit
                </Button>
              </div>
              
              {benefitsControl && benefitsControl.fields.length > 0 ? (
                <div className="space-y-2">
                  {benefitsControl.fields.map((benefitField, benefitIndex) => (
                    <div key={benefitField.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`ticket_types.${index}.benefits.${benefitIndex}`}
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
                        onClick={() => benefitsControl.remove(benefitIndex)}
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
            </div>
          </div>
        );
      })}

      {fields.length === 0 && (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No ticket types added yet</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ 
              name: "", 
              price: 0, 
              description: "", 
              quantity: 1,
              benefits: []
            })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketTypeFormFields;
