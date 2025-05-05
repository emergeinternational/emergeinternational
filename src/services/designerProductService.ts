
import { supabase } from "@/integrations/supabase/client";
import { ProductSubmission, ProductNotification, ProductStatus } from "@/types/shopSubmission";
import { ProductFormValues } from "@/types/shop";
import { toast } from "sonner";

// Get all products for the current designer
export const getDesignerProducts = async (): Promise<ProductSubmission[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .eq("created_by", session.session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as ProductSubmission[] || [];
  } catch (error) {
    console.error("Error fetching designer products:", error);
    toast.error("Failed to load your products");
    return [];
  }
};

// Get all pending product submissions (for admins/editors)
export const getPendingSubmissions = async (): Promise<ProductSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*), profiles!created_by(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as ProductSubmission[] || [];
  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    toast.error("Failed to load pending submissions");
    return [];
  }
};

// Create a new product submission
export const createProductSubmission = async (productData: ProductFormValues): Promise<ProductSubmission | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Not authenticated");
    }

    // Extract variations to insert separately
    const variations = productData.variations || [];
    const { variations: _, ...productWithoutVariations } = productData;
    
    // Create the product with status=pending and set created_by
    const { data, error } = await supabase
      .from("shop_products")
      .insert({
        ...productWithoutVariations,
        status: "pending",
        created_by: session.session.user.id
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // If there are variations, add them
    if (variations.length > 0) {
      const variationsWithProductId = variations.map(variation => ({
        ...variation,
        product_id: data.id
      }));
      
      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);
      
      if (variationsError) {
        console.error("Error adding variations:", variationsError);
        toast.error("Product created but failed to add variations");
      }
    }

    toast.success("Product submitted for approval");
    
    // Get the full product with variations and return
    const { data: fullProduct } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .eq("id", data.id)
      .single();
    
    return fullProduct as ProductSubmission;
  } catch (error) {
    console.error("Error submitting product:", error);
    toast.error("Failed to submit product");
    return null;
  }
};

// Update a product submission
export const updateProductSubmission = async (
  id: string, 
  updates: Partial<ProductFormValues>
): Promise<ProductSubmission | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Not authenticated");
    }

    // Extract variations to update separately
    const variations = updates.variations || [];
    const { variations: _, ...productUpdatesWithoutVariations } = updates;
    
    // Update the product (status is managed by separate function for admins)
    const { data, error } = await supabase
      .from("shop_products")
      .update({
        ...productUpdatesWithoutVariations,
        status: "pending" // Always set back to pending when updated
      })
      .eq("id", id)
      .eq("created_by", session.session.user.id) // Security: ensure only owner can update
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Handle variations: Delete existing and insert new ones
    if (variations.length > 0) {
      // Delete existing variations
      await supabase
        .from("product_variations")
        .delete()
        .eq("product_id", id);
      
      // Insert new variations
      const variationsWithProductId = variations.map(variation => ({
        ...variation,
        product_id: id
      }));
      
      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);
      
      if (variationsError) {
        console.error("Error updating variations:", variationsError);
        toast.error("Product updated but failed to update variations");
      }
    }

    toast.success("Product updated and resubmitted for approval");
    
    // Get the full product with variations and return
    const { data: fullProduct } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .eq("id", id)
      .single();
    
    return fullProduct as ProductSubmission;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product");
    return null;
  }
};

// Save a product as draft (not submitted for approval yet)
export const saveProductDraft = async (
  productData: ProductFormValues,
  existingProductId?: string
): Promise<ProductSubmission | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Not authenticated");
    }

    // Extract variations to insert separately
    const variations = productData.variations || [];
    const { variations: _, ...productWithoutVariations } = productData;
    
    let product;
    
    if (existingProductId) {
      // Update existing draft
      const { data, error } = await supabase
        .from("shop_products")
        .update({
          ...productWithoutVariations,
          status: "draft"
        })
        .eq("id", existingProductId)
        .eq("created_by", session.session.user.id) // Security: ensure only owner can update
        .select("*")
        .single();

      if (error) throw error;
      product = data;
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from("shop_products")
        .insert({
          ...productWithoutVariations,
          status: "draft",
          created_by: session.session.user.id
        })
        .select("*")
        .single();

      if (error) throw error;
      product = data;
    }

    // Handle variations 
    if (existingProductId && variations.length > 0) {
      // Delete existing variations for update
      await supabase
        .from("product_variations")
        .delete()
        .eq("product_id", existingProductId);
    }
    
    // Insert new variations
    if (variations.length > 0) {
      const variationsWithProductId = variations.map(variation => ({
        ...variation,
        product_id: product.id
      }));
      
      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsWithProductId);
      
      if (variationsError) {
        console.error("Error saving variations:", variationsError);
        toast.error("Draft saved but failed to save variations");
      }
    }

    toast.success("Draft saved successfully");
    
    // Get the full product with variations and return
    const { data: fullProduct } = await supabase
      .from("shop_products")
      .select("*, variations:product_variations(*), collection:collections(*)")
      .eq("id", product.id)
      .single();
    
    return fullProduct as ProductSubmission;
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("Failed to save draft");
    return null;
  }
};

// Delete a product (drafts or rejected only)
export const deleteDesignerProduct = async (id: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Not authenticated");
    }
    
    const { error } = await supabase
      .from("shop_products")
      .delete()
      .eq("id", id)
      .eq("created_by", session.session.user.id) // Security: ensure only owner can delete
      .not("status", "eq", "published"); // Cannot delete published products

    if (error) {
      throw error;
    }

    toast.success("Product deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    toast.error("Failed to delete product");
    return false;
  }
};

// Submit a draft for approval
export const submitDraftForApproval = async (id: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error("Not authenticated");
    }
    
    const { error } = await supabase
      .from("shop_products")
      .update({ status: "pending" })
      .eq("id", id)
      .eq("created_by", session.session.user.id) // Security: ensure only owner can submit
      .eq("status", "draft"); // Can only submit drafts

    if (error) {
      throw error;
    }

    toast.success("Product submitted for approval");
    return true;
  } catch (error) {
    console.error("Error submitting product for approval:", error);
    toast.error("Failed to submit product");
    return false;
  }
};

// Admin/Editor: Update product status (approve/reject)
export const updateProductStatus = async (
  id: string, 
  status: ProductStatus, 
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("shop_products")
      .update({ 
        status, 
        rejection_reason: status === 'rejected' ? rejectionReason : null 
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.success(status === 'published' 
      ? "Product approved and published" 
      : "Product submission rejected");
    
    return true;
  } catch (error) {
    console.error("Error updating product status:", error);
    toast.error("Failed to update product status");
    return false;
  }
};

// Get user notifications
export const getUserNotifications = async (): Promise<ProductNotification[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from("product_notifications")
      .select("*, product:shop_products(*)")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as ProductNotification[] || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    toast.error("Failed to load notifications");
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("product_notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Count unread notifications
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return 0;
    }

    const { count, error } = await supabase
      .from("product_notifications")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", session.session.user.id)
      .eq("is_read", false);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting notifications:", error);
    return 0;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return false;
    }

    const { error } = await supabase
      .from("product_notifications")
      .update({ is_read: true })
      .eq("user_id", session.session.user.id)
      .eq("is_read", false);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};
