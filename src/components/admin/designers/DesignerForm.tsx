import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Designer, DesignerSpecialty, CreatorCategory } from '@/types/designerTypes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const specialtyEnum = z.enum([
  'apparel',
  'accessories',
  'footwear',
  'jewelry',
  'other'
] as const);

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }).optional(),
  bio: z.string().optional(),
  specialty: specialtyEnum,
  category: z.enum([
    'fashion_designer',
    'model',
    'photographer',
    'event_planner',
    'interior_designer',
    'graphic_designer',
    'visual_artist',
    'creative_director'
  ] as const, {
    required_error: "Please select a category.",
  }),
  portfolio_url: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  location: z.string().optional(),
  featured: z.boolean().default(false),
  image_url: z.string().url({
    message: "Please enter a valid image URL.",
  }).optional(),
});

export interface DesignerFormProps {
  onSubmit: (data: Partial<Designer>) => void;
  defaultValues?: Partial<Designer>;
  isLoading?: boolean;
  initialData?: Partial<Designer>;
  onSuccess?: () => void;
}

export const DesignerForm: React.FC<DesignerFormProps> = ({ onSubmit, defaultValues, isLoading, initialData, onSuccess }) => {
  const valuesToUse = initialData || defaultValues || {
    full_name: '',
    email: '',
    bio: '',
    specialty: 'apparel' as DesignerSpecialty,
    category: 'fashion_designer' as CreatorCategory,
    portfolio_url: '',
    location: '',
    featured: false,
    image_url: '',
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: valuesToUse,
    mode: "onChange"
  });

  const { handleSubmit, register, formState: { errors }, control } = form;

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" type="text" {...register("full_name")} disabled={isLoading} />
        {errors.full_name && (
          <p className="text-red-500 text-sm">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} disabled={isLoading} />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...register("bio")} disabled={isLoading} />
        {errors.bio && (
          <p className="text-red-500 text-sm">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="specialty">Specialty</Label>
        <Select
          onValueChange={(value) => form.setValue('specialty', value as DesignerSpecialty)}
          defaultValue={valuesToUse.specialty as string}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="footwear">Footwear</SelectItem>
            <SelectItem value="jewelry">Jewelry</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.specialty && (
          <p className="text-red-500 text-sm">{errors.specialty.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          onValueChange={(value) => form.setValue('category', value as CreatorCategory)}
          defaultValue={valuesToUse.category}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fashion_designer">Fashion Designer</SelectItem>
            <SelectItem value="model">Model</SelectItem>
            <SelectItem value="photographer">Photographer</SelectItem>
            <SelectItem value="event_planner">Event Planner</SelectItem>
            <SelectItem value="interior_designer">Interior Designer</SelectItem>
            <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
            <SelectItem value="visual_artist">Visual Artist</SelectItem>
            <SelectItem value="creative_director">Creative Director</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="portfolio_url">Portfolio URL</Label>
        <Input id="portfolio_url" type="url" {...register("portfolio_url")} disabled={isLoading} />
        {errors.portfolio_url && (
          <p className="text-red-500 text-sm">{errors.portfolio_url.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" type="text" {...register("location")} disabled={isLoading} />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" type="url" {...register("image_url")} disabled={isLoading} />
        {errors.image_url && (
          <p className="text-red-500 text-sm">{errors.image_url.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="featured">Featured</Label>
        <input
          id="featured"
          type="checkbox"
          className="ml-2"
          {...register("featured")}
          disabled={isLoading}
        />
        {errors.featured && (
          <p className="text-red-500 text-sm">{errors.featured.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};
