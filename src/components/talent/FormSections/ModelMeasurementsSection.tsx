
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ModelMeasurementsSectionProps {
  form: UseFormReturn<any>;
  show: boolean;
}

export const ModelMeasurementsSection = ({ form, show }: ModelMeasurementsSectionProps) => {
  if (!show) return null;

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-black">Model Measurements</h3>
        <p className="text-gray-600 text-sm mb-4">
          Please provide your measurements accurately. All measurements should be in centimeters (cm) unless specified otherwise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Height</FormLabel>
              <FormControl>
                <Input placeholder="175 cm" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">Enter height in centimeters</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Weight</FormLabel>
              <FormControl>
                <Input placeholder="65 kg" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">Enter weight in kilograms</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.bust"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Bust/Chest</FormLabel>
              <FormControl>
                <Input placeholder="90 cm" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">Measure around the fullest part</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.waist"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Waist</FormLabel>
              <FormControl>
                <Input placeholder="60 cm" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">Measure at natural waistline</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.hips"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Hips</FormLabel>
              <FormControl>
                <Input placeholder="90 cm" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">Measure at fullest part of hips</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dressSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Dress Size</FormLabel>
              <FormControl>
                <Input placeholder="US 4 / EU 34" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">US/EU size preferred</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shoeSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">Shoe Size</FormLabel>
              <FormControl>
                <Input placeholder="US 7 / EU 37.5" {...field} />
              </FormControl>
              <p className="text-xs text-gray-500">US/EU size preferred</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
