
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TalentFormData } from "@/types/talentTypes";

interface ModelMeasurementsSectionProps {
  form: UseFormReturn<TalentFormData>;
  show: boolean;
  gender: string;
}

export const ModelMeasurementsSection = ({ form, show, gender }: ModelMeasurementsSectionProps) => {
  if (!show) return null;

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h3 className="text-lg font-medium">Model Measurements</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="measurements.height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="175" {...field} />
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
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="65" {...field} />
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
                <FormLabel>Bust (cm)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="90" {...field} />
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
                <FormLabel>Chest (cm)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="100" {...field} />
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
              <FormLabel>Waist (cm)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="75" {...field} />
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
              <FormLabel>Hips (cm)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="90" {...field} />
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
                <FormLabel>Shoulders (cm)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="45" {...field} />
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
              <FormLabel>Inseam (cm)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="80" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dressSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dress/Shirt Size</FormLabel>
              <FormControl>
                <Input type="text" placeholder="M/38" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shoeSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shoe Size</FormLabel>
              <FormControl>
                <Input type="text" placeholder="42" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
