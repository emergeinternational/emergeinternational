
import { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ModelMeasurementsSectionProps {
  form: UseFormReturn<any>;
  show: boolean;
  gender: string;
}

export const ModelMeasurementsSection = ({ form, show, gender }: ModelMeasurementsSectionProps) => {
  useEffect(() => {
    if (show) {
      // Initialize measurements object if it doesn't exist
      const currentValues = form.getValues();
      if (!currentValues.measurements) {
        form.setValue('measurements', {
          height: '',
          weight: '',
          chest: '',
          waist: '',
          hips: '',
          shoulders: '',
          inseam: '',
        });
      }
    }
  }, [show, form]);

  if (!show) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Physical Measurements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="measurements.height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (in cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Height in cm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (in kg)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Weight in kg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {gender === "Female" && (
          <FormField
            control={form.control}
            name="measurements.bust"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bust (in cm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Bust measurement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {gender === "Male" && (
          <FormField
            control={form.control}
            name="measurements.chest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chest (in cm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Chest measurement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="measurements.waist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waist (in cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Waist measurement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.hips"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hips (in cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Hips measurement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {gender === "Male" && (
          <FormField
            control={form.control}
            name="measurements.shoulders"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shoulders (in cm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Shoulders measurement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="measurements.inseam"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inseam (in cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Inseam measurement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
