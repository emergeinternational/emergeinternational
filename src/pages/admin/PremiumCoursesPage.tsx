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
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createPremiumCourse,
  getPremiumCourses,
  updatePremiumCourse,
  deletePremiumCourse,
  getCourseCategories
} from "@/services/premiumCourseService";
import { PremiumCourse } from "@/types";
import MainLayout from '@/layouts/MainLayout';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.number().min(1, {
    message: "Price must be greater than 0.",
  }),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  categoryId: z.string().min(1, {
    message: "Category must be selected.",
  }),
  imageUrl: z.string().url({ message: "Invalid URL" }),
  videoUrl: z.string().url({ message: "Invalid URL" }),
});

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'approved':
      return 'secondary';
    default:
      return 'default';
  }
};

const PremiumCoursesPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courseIdToEdit, setCourseIdToEdit] = useState<string | null>(null);

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['premiumCourses'],
    queryFn: getPremiumCourses,
  });

  const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useQuery({
    queryKey: ['courseCategories'],
    queryFn: getCourseCategories,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      status: 'pending',
      categoryId: "",
      imageUrl: "",
      videoUrl: "",
    },
  });

  useEffect(() => {
    if (courseIdToEdit && courses) {
      const courseToEdit = courses.find((course) => course.id === courseIdToEdit);
      if (courseToEdit) {
        form.reset({
          title: courseToEdit.title,
          description: courseToEdit.description,
          price: courseToEdit.price,
          status: courseToEdit.status,
          categoryId: courseToEdit.categoryId,
          imageUrl: courseToEdit.imageUrl,
          videoUrl: courseToEdit.videoUrl,
        });
      }
    }
  }, [courseIdToEdit, courses, form]);

  const { mutate: createCourse } = useMutation(createPremiumCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['premiumCourses']);
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const { mutate: updateCourse } = useMutation(updatePremiumCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['premiumCourses']);
      setIsDialogOpen(false);
      setIsEditing(false);
      setCourseIdToEdit(null);
      form.reset();
    },
  });

  const { mutate: removeCourse } = useMutation(deletePremiumCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['premiumCourses']);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing && courseIdToEdit) {
      updateCourse({ id: courseIdToEdit, ...values });
    } else {
      createCourse({ ...values, price: Number(values.price) });
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditing(false);
    setCourseIdToEdit(null);
    form.reset();
  };

  const handleEditCourse = (courseId: string) => {
    setIsDialogOpen(true);
    setIsEditing(true);
    setCourseIdToEdit(courseId);
  };

  const handleDeleteCourse = (courseId: string) => {
    removeCourse(courseId);
  };

  if (isLoading || isCategoriesLoading) return <div>Loading...</div>;
  if (isError || isCategoriesError) return <div>Error fetching data</div>;

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
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>{course.price}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(course.status)}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{categories?.find(cat => cat.id === course.categoryId)?.name}</TableCell>
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
                  {courses?.length} courses total
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Course Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Course Price"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
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
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Image URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Video URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
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
