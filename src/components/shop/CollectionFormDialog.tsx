
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collection } from "@/types/shop";
import { createCollection, updateCollection } from "@/services/collectionService";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  designer_name: z.string().min(2, "Designer name must be at least 2 characters"),
  description: z.string().optional(),
});

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onSuccess: (collection: Collection | null) => void;
}

const CollectionFormDialog: React.FC<CollectionFormDialogProps> = ({
  open,
  onOpenChange,
  collection,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!collection;

  const defaultValues = {
    title: collection?.title || "",
    designer_name: collection?.designer_name || "",
    description: collection?.description || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      let savedCollection: Collection | null = null;
      
      if (isEditing && collection) {
        savedCollection = await updateCollection(collection.id, values);
      } else {
        savedCollection = await createCollection(values);
      }
      
      onSuccess(savedCollection);
      form.reset(defaultValues);
      onOpenChange(false);
    } catch (error) {
      console.error("Collection form error:", error);
      onSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Collection 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Designer name" {...field} />
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
                    <Textarea 
                      placeholder="Collection description" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Collection" : "Create Collection"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionFormDialog;
