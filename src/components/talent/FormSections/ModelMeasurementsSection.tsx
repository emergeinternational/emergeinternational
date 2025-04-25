
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ModelMeasurementsSectionProps {
  form: UseFormReturn<any>;
  show: boolean;
  gender: string;
}

export const ModelMeasurementsSection = ({ form, show, gender }: ModelMeasurementsSectionProps) => {
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
              <FormDescription className="text-xs text-gray-500">
                Enter height in centimeters
              </FormDescription>
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
              <FormDescription className="text-xs text-gray-500">
                Enter weight in kilograms
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {gender === "Male" ? (
          <>
            <FormField
              control={form.control}
              name="measurements.chest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Chest</FormLabel>
                  <FormControl>
                    <Input placeholder="100 cm" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Measure around the fullest part of chest
                  </FormDescription>
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
                    <Input placeholder="80 cm" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Measure at natural waistline
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="measurements.shoulders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Shoulders</FormLabel>
                  <FormControl>
                    <Input placeholder="45 cm" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Measure shoulder width
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="measurements.inseam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Inseam</FormLabel>
                  <FormControl>
                    <Input placeholder="82 cm" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Measure from crotch to ankle
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="measurements.bust"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">Bust</FormLabel>
                  <FormControl>
                    <Input placeholder="90 cm" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Measure around fullest part of bust
                  </FormDescription>
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
                  <FormDescription className="text-xs text-gray-500">
                    Measure at smallest part of waist
                  </FormDescription>
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
                  <FormDescription className="text-xs text-gray-500">
                    Measure at fullest part of hips
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="dressSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-black">
                {gender === "Male" ? "Suit Size" : "Dress Size"}
              </FormLabel>
              <FormControl>
                <Input placeholder="US 4 / EU 34" {...field} />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                US/EU size preferred
              </FormDescription>
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
              <FormDescription className="text-xs text-gray-500">
                US/EU size preferred
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
