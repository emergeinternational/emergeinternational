
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PerformerSection = ({ form, show }) => {
  if (!show) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Performance Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="demoReelUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Demo Reel URL</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://youtube.com/your-demo-reel" 
                  className="bg-gray-800 border-gray-700 text-white"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="languagesSpoken"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Languages Spoken</FormLabel>
              <FormControl>
                <Input 
                  placeholder="English, Amharic, etc." 
                  className="bg-gray-800 border-gray-700 text-white"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="travelAvailability"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Travel Availability</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select travel availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="Local Only">Local Only</SelectItem>
                  <SelectItem value="Domestic Travel">Domestic Travel</SelectItem>
                  <SelectItem value="International OK">International OK</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Experience Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
