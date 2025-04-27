
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPremiumCourse, uploadPremiumCourseImage } from "@/services/premiumCourseService";

interface FormInputs {
  title: string;
  summary: string;
  category: string;
  level: string;
  hosting_type: string;
  start_date: string;
  end_date: string;
  student_capacity: number;
}

const PremiumCourseUploadForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    try {
      const imageInput = document.querySelector<HTMLInputElement>('#course-image');
      let imagePath = undefined;

      if (imageInput?.files?.[0]) {
        imagePath = await uploadPremiumCourseImage(imageInput.files[0]);
      }

      const courseId = await createPremiumCourse({
        ...data,
        image_path: imagePath,
        is_published: false,
      });

      if (courseId) {
        toast({
          title: "Success",
          description: "Premium course created successfully",
        });
        reset();
      } else {
        throw new Error("Failed to create course");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create premium course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Premium Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title*</Label>
            <Input 
              id="title" 
              {...register("title", { required: true })}
              className="mt-1" 
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea 
              id="summary" 
              {...register("summary")}
              className="mt-1" 
            />
          </div>

          <div>
            <Label htmlFor="category">Category*</Label>
            <Select onValueChange={(value) => register("category").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
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
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select onValueChange={(value) => register("level").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hosting_type">Hosting Type*</Label>
            <Select onValueChange={(value) => register("hosting_type").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select hosting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hosted">Hosted</SelectItem>
                <SelectItem value="embedded">Embedded</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="course-image">Course Image</Label>
            <Input 
              id="course-image" 
              type="file" 
              accept="image/*"
              className="mt-1" 
            />
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input 
              id="start_date" 
              type="datetime-local" 
              {...register("start_date")}
              className="mt-1" 
            />
          </div>

          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input 
              id="end_date" 
              type="datetime-local" 
              {...register("end_date")}
              className="mt-1" 
            />
          </div>

          <div>
            <Label htmlFor="student_capacity">Student Capacity</Label>
            <Input 
              id="student_capacity" 
              type="number" 
              {...register("student_capacity")}
              placeholder="20"
              className="mt-1" 
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Premium Course"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PremiumCourseUploadForm;
