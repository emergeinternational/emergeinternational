
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
      console.error("Error fetching collections:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCollections:", error);
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
      console.error("Error creating collection:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createCollection:", error);
    toast.error("Failed to create collection");
    return null;
  }
};

// Update a collection
export const updateCollection = async (id: string, updates: Partial<Collection>): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating collection:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateCollection:", error);
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
      console.error("Error deleting collection:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCollection:", error);
    toast.error("Failed to delete collection");
    return false;
  }
};
