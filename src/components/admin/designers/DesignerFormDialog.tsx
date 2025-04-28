
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Designer, CreatorCategory } from '@/services/designerTypes';

interface DesignerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designer?: Designer;
  onSuccess: () => void;
}

const DesignerFormDialog: React.FC<DesignerFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  designer, 
  onSuccess 
}) => {
  const isEditing = !!designer;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Designer>>(designer || {
    full_name: '',
    email: '',
    bio: '',
    specialty: '',
    category: 'fashion_designer' as CreatorCategory,
    portfolio_url: '',
    location: '',
    social_media: {
      instagram: '',
      facebook: '',
      twitter: '',
      website: '',
    },
    image_url: '',
    featured: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...(prev.social_media || {}),
        [platform]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (isEditing && designer) {
        const { error } = await supabase
          .from('designers')
          .update(submitData)
          .eq('id', designer.id);

        if (error) throw error;
        toast.success('Designer updated successfully');
      } else {
        const { error } = await supabase
          .from('designers')
          .insert([submitData]);

        if (error) throw error;
        toast.success('Designer created successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving designer:', error);
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Designer' : 'Add New Designer'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Designer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="designer@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
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
                value={formData.specialty || ''}
                onChange={(e) => handleChange('specialty', e.target.value)}
                placeholder="e.g., Apparel, Accessories, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                value={formData.portfolio_url || ''}
                onChange={(e) => handleChange('portfolio_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Profile Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.social_media?.instagram || ''}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured">Featured Designer</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => handleChange('featured', checked)}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  {formData.featured ? 'Yes' : 'No'}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief description of the designer's background and style"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Designer' : 'Create Designer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerFormDialog;
