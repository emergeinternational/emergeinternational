
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const ModelMeasurementsSection = ({ form, show }) => {
  if (!show) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Model Measurements</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="175" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="65" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.bust"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bust/Chest (cm)</FormLabel>
              <FormControl>
                <Input placeholder="90" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measurements.waist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waist (cm)</FormLabel>
              <FormControl>
                <Input placeholder="60" {...field} />
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
                <Input placeholder="90" {...field} />
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
              <FormLabel>Dress Size</FormLabel>
              <FormControl>
                <Input placeholder="8 US / 38 EU" {...field} />
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
                <Input placeholder="7 US / 37.5 EU" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
