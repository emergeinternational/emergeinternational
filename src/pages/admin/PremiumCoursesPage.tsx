
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPremiumCourse,
  listPublishedPremiumCourses,
  PremiumCourse,
  uploadPremiumCourseImage
} from "@/services/premiumCourseService";
import MainLayout from '@/layouts/MainLayout';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  summary: z.string().min(10, {
    message: "Summary must be at least 10 characters.",
  }),
  category: z.enum(['model', 'designer', 'photographer', 'videographer', 'musical_artist', 'fine_artist', 'event_planner']),
  level: z.enum(['beginner', 'intermediate', 'expert']),
  hosting_type: z.enum(['hosted', 'embedded', 'external']),
  image_url: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  student_capacity: z.number().min(1).default(20)
});

const getStatusBadgeVariant = (isPublished: boolean): "default" | "secondary" | "destructive" | "outline" => {
  return isPublished ? "secondary" : "outline";
};

const PremiumCoursesPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courseIdToEdit, setCourseIdToEdit] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['premiumCourses'],
    queryFn: listPublishedPremiumCourses,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      category: "model",
      level: "beginner",
      hosting_type: "hosted",
      image_url: "",
      start_date: "",
      end_date: "",
      student_capacity: 20
    },
  });

  useEffect(() => {
    if (courseIdToEdit && courses) {
      const courseToEdit = courses.find((course) => course.id === courseIdToEdit);
      if (courseToEdit) {
        form.reset({
          title: courseToEdit.title,
          summary: courseToEdit.summary || "",
          category: courseToEdit.category,
          level: courseToEdit.level,
          hosting_type: courseToEdit.hosting_type,
          start_date: courseToEdit.start_date || "",
          end_date: courseToEdit.end_date || "",
          student_capacity: courseToEdit.student_capacity
        });
      }
    }
  }, [courseIdToEdit, courses, form]);

  const createCourseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      let imagePath = null;
      if (selectedImage) {
        imagePath = await uploadPremiumCourseImage(selectedImage);
      }
      
      await createPremiumCourse({
        ...data,
        image_path: imagePath,
        is_published: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiumCourses'] });
      setIsDialogOpen(false);
      form.reset();
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Course created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      });
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof formSchema> }) => {
      let imagePath = null;
      if (selectedImage) {
        imagePath = await uploadPremiumCourseImage(selectedImage);
      }
      
      const { error } = await supabase
        .from('premium_courses')
        .update({
          ...data,
          image_path: imagePath || undefined,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiumCourses'] });
      setIsDialogOpen(false);
      setIsEditing(false);
      setCourseIdToEdit(null);
      form.reset();
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('premium_courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiumCourses'] });
      toast({
        title: "Success",
        description: "Course deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing && courseIdToEdit) {
      updateCourseMutation.mutate({ id: courseIdToEdit, data: values });
    } else {
      createCourseMutation.mutate(values);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditing(false);
    setCourseIdToEdit(null);
    form.reset();
    setSelectedImage(null);
  };

  const handleEditCourse = (courseId: string) => {
    setIsDialogOpen(true);
    setIsEditing(true);
    setCourseIdToEdit(courseId);
    setSelectedImage(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourseMutation.mutate(courseId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data</div>;

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Premium Courses</h1>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>

        <ScrollArea>
          <Table>
            <TableCaption>A list of your premium courses.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses && courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.summary || "No summary"}</TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(course.is_published)}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCourse(course.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            the course from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {courses ? courses.length : 0} courses total
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{isEditing ? "Edit Course" : "Add Course"}</AlertDialogTitle>
            </AlertDialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Course Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Input placeholder="Course Summary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  )}
                />
                <FormField
                  control={form.control}
                  name="hosting_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hosting Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="student_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button 
                    type="submit" 
                    disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                  >
                    {createCourseMutation.isPending || updateCourseMutation.isPending ? 
                      "Processing..." : isEditing ? "Update" : "Create"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default PremiumCoursesPage;
