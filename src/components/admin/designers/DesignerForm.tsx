
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Designer, CreatorCategory } from '@/services/designerTypes';

interface DesignerFormProps {
  designer?: Designer;
  onSuccess: () => void;
  onCancel?: () => void;
}

const DesignerForm: React.FC<DesignerFormProps> = ({ designer, onSuccess, onCancel }) => {
  const isEditing = !!designer;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Designer>({
    defaultValues: designer || {
      full_name: '',
      email: '',
      bio: '',
      specialty: '',
      category: 'fashion_designer',
      portfolio_url: '',
      location: '',
      social_media: {
        instagram: '',
        twitter: '',
        facebook: '',
        website: '',
      },
      image_url: '',
      featured: false,
    },
  });

  const watchCategory = watch('category');
  const watchFeatured = watch('featured');

  const onSubmit = async (data: Designer) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && designer) {
        const { error } = await supabase
          .from('designers')
          .update(formData)
          .eq('id', designer.id);

        if (error) throw error;
        toast.success('Designer updated successfully');
      } else {
        const { error } = await supabase
          .from('designers')
          .insert([formData]);

        if (error) throw error;
        toast.success('Designer created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving designer:', error);
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            {...register('full_name', { required: 'Name is required' })}
            placeholder="Designer name"
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { required: 'Email is required' })}
            placeholder="designer@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            defaultValue={watchCategory}
            onValueChange={(value) => setValue('category', value as CreatorCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fashion_designer">Fashion Designer</SelectItem>
              <SelectItem value="interior_designer">Interior Designer</SelectItem>
              <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
              <SelectItem value="photographer">Photographer</SelectItem>
              <SelectItem value="model">Model</SelectItem>
              <SelectItem value="visual_artist">Visual Artist</SelectItem>
              <SelectItem value="event_planner">Event Planner</SelectItem>
              <SelectItem value="creative_director">Creative Director</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            {...register('specialty', { required: 'Specialty is required' })}
            placeholder="e.g., Apparel, Accessories, etc."
          />
          {errors.specialty && (
            <p className="text-red-500 text-sm">{errors.specialty.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="City, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio_url">Portfolio URL</Label>
          <Input
            id="portfolio_url"
            {...register('portfolio_url')}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Profile Image URL</Label>
          <Input
            id="image_url"
            {...register('image_url')}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            {...register('social_media.instagram')}
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured">Featured Designer</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={watchFeatured}
              onCheckedChange={(checked) => setValue('featured', checked)}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              {watchFeatured ? 'Yes' : 'No'}
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2 col-span-2">
        <Label htmlFor="bio">Biography</Label>
        <Textarea
          id="bio"
          {...register('bio', { required: 'Bio is required' })}
          placeholder="Brief description of the designer's background and style"
          rows={4}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{errors.bio.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Designer' : 'Create Designer'}
        </Button>
      </div>
    </form>
  );
};

export default DesignerForm;
