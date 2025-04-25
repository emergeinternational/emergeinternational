
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const SocialSection = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Social Media & Portfolio</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="instagramHandle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Handle</FormLabel>
              <FormControl>
                <Input placeholder="@yourusername" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio/Website URL</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://yourportfolio.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
