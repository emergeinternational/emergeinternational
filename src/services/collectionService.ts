
import { supabase } from "@/integrations/supabase/client";
import { Collection } from "@/types/shop";
import { toast } from "sonner";

// Get all collections
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
    toast.error("Failed to load collections");
    return [];
  }
};

// Create a new collection
export const createCollection = async (collectionData: Partial<Collection>): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .insert(collectionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Collection created successfully");
    return data;
  } catch (error) {
    console.error("Error creating collection:", error);
    toast.error("Failed to create collection");
    return null;
  }
};

// Update an existing collection
export const updateCollection = async (id: string, updates: Partial<Collection>): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Collection updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating collection:", error);
    toast.error("Failed to update collection");
    return null;
  }
};

// Delete a collection
export const deleteCollection = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.success("Collection deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting collection:", error);
    toast.error("Failed to delete collection");
    return false;
  }
};
