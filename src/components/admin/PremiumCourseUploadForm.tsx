import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { uploadPremiumCourseImage, createPremiumCourse } from "@/services/premiumCourseService";
import { CourseCategory, CourseLevel, CourseHostingType } from "@/services/courseTypes";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function PremiumCourseUploadForm() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<CourseCategory>('model');
  const [level, setLevel] = useState<CourseLevel>('beginner');
  const [hostingType, setHostingType] = useState<CourseHostingType>('hosted');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<any>(undefined);
  const [endDate, setEndDate] = useState<any>(undefined);
  const [studentCapacity, setStudentCapacity] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setCategory('model');
    setLevel('beginner');
    setHostingType('hosted');
    setSelectedImage(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setStudentCapacity('20');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imagePath = null;
      if (selectedImage) {
        imagePath = await uploadPremiumCourseImage(selectedImage);
        if (!imagePath) {
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
        toast({
          title: "Error",
          description: "Start date cannot be after end date",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const courseData = {
        title,
        summary,
        category: category as CourseCategory,
        level: level as CourseLevel,
        hosting_type: hostingType as CourseHostingType,
        image_path: imagePath,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        student_capacity: parseInt(studentCapacity) || 20,
        is_published: false
      };

      const courseId = await createPremiumCourse(courseData);

      if (courseId) {
        toast({
          title: "Success",
          description: "Course created successfully"
        });
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to create course",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course Title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Course Summary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={category} onValueChange={(value) => setCategory(value as CourseCategory)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="model">Model</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="photographer">Photographer</SelectItem>
                  <SelectItem value="videographer">Videographer</SelectItem>
                  <SelectItem value="musical_artist">Musical Artist</SelectItem>
                  <SelectItem value="fine_artist">Fine Artist</SelectItem>
                  <SelectItem value="event_planner">Event Planner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Level</FormLabel>
              <Select value={level} onValueChange={(value) => setLevel(value as CourseLevel)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Hosting Type</FormLabel>
              <Select value={hostingType} onValueChange={(value) => setHostingType(value as CourseHostingType)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hosting type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hosted">Hosted</SelectItem>
                  <SelectItem value="embedded">Embedded</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedImage(e.target.files[0]);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={startDate ? startDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    if (endDate && new Date(newStartDate) > new Date(endDate)) {
                      toast({
                        title: "Warning",
                        description: "Start date cannot be after end date",
                        variant: "destructive"
                      });
                      return;
                    }
                    setStartDate(newStartDate);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={endDate ? endDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    if (startDate && new Date(newEndDate) < new Date(startDate)) {
                      toast({
                        title: "Warning",
                        description: "End date cannot be before start date",
                        variant: "destructive"
                      });
                      return;
                    }
                    setEndDate(newEndDate);
                  }}
                  min={startDate} // Prevent end date before start date
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>Student Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={studentCapacity}
                  onChange={(e) => setStudentCapacity(e.target.value)}
                  placeholder="Student Capacity"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
