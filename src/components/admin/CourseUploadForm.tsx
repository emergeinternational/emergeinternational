
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AlertCircle, Check, X } from 'lucide-react';
import { createVerifiedCourse } from '@/services/courseScraperService';
import { useStorage } from '@/hooks/useStorage';
import { Course } from '@/services/courseTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

const CourseUploadForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    summary: '',
    category: 'model',
    level: 'beginner',
    hosting_type: 'embedded',
    video_embed_url: '',
    external_link: '',
    is_published: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { uploadFile, ensureBucket } = useStorage();
  const { toast } = useToast();
  
  // Categories and levels
  const categories = [
    { value: 'model', label: 'Model' },
    { value: 'designer', label: 'Designer' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'musical_artist', label: 'Musical Artist' },
    { value: 'fine_artist', label: 'Fine Artist' },
    { value: 'event_planner', label: 'Event Planner' },
  ];
  
  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' },
  ];
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Clear error when field is edited
      if (formErrors['image']) {
        setFormErrors({ ...formErrors, image: '' });
      }
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.summary?.trim()) {
      errors.summary = 'Summary is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.level) {
      errors.level = 'Level is required';
    }
    
    // Validate based on hosting type
    if (formData.hosting_type === 'embedded' && !formData.video_embed_url?.trim()) {
      errors.video_embed_url = 'Video embed URL is required for embedded courses';
    }
    
    if (formData.hosting_type === 'external' && !formData.external_link?.trim()) {
      errors.external_link = 'External link is required for external courses';
    }
    
    // Check if we have no image
    if (!imageFile && !previewUrl) {
      errors.image = 'Course image is required';
    }
    
    // YouTube/Vimeo validation for embedded courses
    if (
      formData.hosting_type === 'embedded' && 
      formData.video_embed_url && 
      !isValidEmbedUrl(formData.video_embed_url)
    ) {
      errors.video_embed_url = 'Invalid embed URL. Must be from YouTube or Vimeo';
    }
    
    // Basic URL validation for external links
    if (
      formData.hosting_type === 'external' && 
      formData.external_link && 
      !isValidUrl(formData.external_link)
    ) {
      errors.external_link = 'Invalid URL format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Check if a URL is valid
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Check if an embed URL is from YouTube or Vimeo
  const isValidEmbedUrl = (url: string) => {
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoPattern = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;
    return youtubePattern.test(url) || vimeoPattern.test(url);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ensure course_images bucket exists
      await ensureBucket('course_images', { public: true });
      
      let imageUrl = '';
      
      // Upload image if we have a file
      if (imageFile) {
        const fileName = `course-${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
        imageUrl = await uploadFile('course_images', imageFile, fileName);
      } else if (previewUrl && previewUrl.startsWith('http')) {
        // If no new file but we have a URL, use that
        imageUrl = previewUrl;
      }
      
      // Create course with image
      const courseData: Partial<Course> = {
        ...formData,
        image_url: imageUrl,
      };
      
      // Submit the course
      const courseId = await createVerifiedCourse(courseData as Omit<Course, 'id' | 'created_at' | 'updated_at'>);
      
      if (courseId) {
        toast({
          title: "Success",
          description: "Course created successfully!",
          variant: "default"
        });
        
        // Reset form
        setFormData({
          title: '',
          summary: '',
          category: 'model',
          level: 'beginner',
          hosting_type: 'embedded',
          video_embed_url: '',
          external_link: '',
          is_published: false
        });
        setImageFile(null);
        setPreviewUrl('');
      } else {
        throw new Error("Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Verified Course</CardTitle>
        <CardDescription>
          Create a new verified course for the Emerge Fashion Academy platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">
                  Course Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary" className="font-medium">
                  Summary <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Brief description of the course"
                  rows={3}
                />
                {formErrors.summary && (
                  <p className="text-sm text-red-500">{formErrors.summary}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-sm text-red-500">{formErrors.category}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level" className="font-medium">
                    Level <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleSelectChange('level', value)}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.level && (
                    <p className="text-sm text-red-500">{formErrors.level}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium">Hosting Type <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={formData.hosting_type}
                  onValueChange={(value) => handleSelectChange('hosting_type', value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="embedded" id="embedded" />
                    <Label htmlFor="embedded">Embedded (YouTube/Vimeo)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="external" id="external" />
                    <Label htmlFor="external">External Link</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.hosting_type === 'embedded' && (
                <div className="space-y-2">
                  <Label htmlFor="video_embed_url" className="font-medium">
                    Video Embed URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="video_embed_url"
                    name="video_embed_url"
                    value={formData.video_embed_url}
                    onChange={handleChange}
                    placeholder="YouTube or Vimeo URL"
                  />
                  {formErrors.video_embed_url && (
                    <p className="text-sm text-red-500">{formErrors.video_embed_url}</p>
                  )}
                </div>
              )}
              
              {formData.hosting_type === 'external' && (
                <div className="space-y-2">
                  <Label htmlFor="external_link" className="font-medium">
                    External Link <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="external_link"
                    name="external_link"
                    value={formData.external_link}
                    onChange={handleChange}
                    placeholder="https://example.com/course"
                  />
                  {formErrors.external_link && (
                    <p className="text-sm text-red-500">{formErrors.external_link}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_published: checked })
                  }
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-image" className="font-medium">
                  Course Image <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Course preview" 
                        className="mx-auto max-h-64 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label 
                        htmlFor="course-image" 
                        className="cursor-pointer text-emerge-gold hover:text-emerge-gold/80"
                      >
                        Click to upload course image
                      </label>
                      <p className="text-sm text-gray-400">
                        PNG, JPG or WEBP (max 5MB)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    id="course-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {formErrors.image && (
                  <p className="text-sm text-red-500">{formErrors.image}</p>
                )}
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  Please ensure all links have been tested and are working before uploading.
                  Once published, students will be able to access this course.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <CardFooter className="flex justify-end px-0 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerge-gold hover:bg-emerge-gold/90"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-1">⌛</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="mr-1" size={16} />
                  Upload Course
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseUploadForm;
