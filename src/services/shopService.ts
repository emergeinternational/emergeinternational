
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id?: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Mock data for initial testing
const mockProducts: Product[] = [
  {
    id: "1",
    title: "Emerge T-Shirt",
    price: 4800,
    description: "Premium quality cotton t-shirt with Emerge logo",
    image_url: "/placeholder.svg",
    category: "clothing",
    in_stock: true
  },
  {
    id: "2",
    title: "Designer Earrings",
    price: 12500,
    description: "Handcrafted designer earrings from local artisans",
    image_url: "/placeholder.svg",
    category: "accessories",
    in_stock: true
  },
  {
    id: "3",
    title: "Leather Bag",
    price: 4800,
    description: "Genuine leather bag with custom design",
    image_url: "/placeholder.svg",
    category: "accessories",
    in_stock: true
  },
  {
    id: "4",
    title: "Tailored Coat",
    price: 12500,
    description: "Premium tailored coat for all seasons",
    image_url: "/placeholder.svg",
    category: "clothing",
    in_stock: true
  }
];

// Flag to use mock data or actual database
let useMockData = true;

/**
 * Toggle between mock data and database
 */
export const toggleMockData = (useDatabase: boolean) => {
  useMockData = !useDatabase;
  return useMockData;
};

/**
 * Get all products from the database
 */
export const getAllProducts = async (): Promise<Product[]> => {
  if (useMockData) {
    console.log('Using mock shop data');
    return Promise.resolve(mockProducts);
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  if (useMockData) {
    return Promise.resolve(mockProducts.filter(p => p.category === category));
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    return [];
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  if (useMockData) {
    const product = mockProducts.find(p => p.id === id);
    return Promise.resolve(product || null);
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
};

/**
 * Add a new product
 */
export const addProduct = async (product: Product): Promise<Product | null> => {
  if (useMockData) {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return Promise.resolve(newProduct);
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .insert(product)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to add product:', error);
    return null;
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  if (useMockData) {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = {
        ...mockProducts[index],
        ...product,
        updated_at: new Date().toISOString()
      };
      return Promise.resolve(mockProducts[index]);
    }
    return Promise.resolve(null);
  }
  
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .update({
        ...product,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to update product:', error);
    return null;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  if (useMockData) {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
  
  try {
    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
};

/**
 * Format price to currency string
 */
export const formatPrice = (price: number, currencyCode = 'ETB'): string => {
  return `${currencyCode} ${price.toLocaleString('en-US')}`;
};
