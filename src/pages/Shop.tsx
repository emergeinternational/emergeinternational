
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { ChevronRight, Globe } from "lucide-react";
import { ShippingBanner } from "@/components/ShippingBanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductCategory } from "@/services/productTypes";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = [
    { id: "new_arrivals", name: "New Arrivals" },
    { id: "clothing", name: "Clothing" },
    { id: "footwear", name: "Footwear" },
    { id: "accessories", name: "Accessories" },
  ];

  // Mock products that match the ProductsManager structure
  const mockProducts: Product[] = [
    { 
      id: "mock-1", 
      title: "Emerge T-Shirt", 
      price: 4800, 
      category: "clothing", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Comfortable cotton t-shirt with Emerge logo",
      sales_count: 12
    },
    { 
      id: "mock-2", 
      title: "Designer Earrings", 
      price: 12500, 
      category: "accessories", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Handcrafted designer earrings",
      sales_count: 5
    },
    { 
      id: "mock-3", 
      title: "Leather Bag", 
      price: 4800, 
      category: "accessories", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Premium leather bag with custom design",
      sales_count: 8
    },
    { 
      id: "mock-4", 
      title: "Tailored Coat", 
      price: 12500, 
      category: "clothing", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Tailored coat for all seasons",
      sales_count: 3
    },
    { 
      id: "mock-5", 
      title: "Woven Sandals", 
      price: 3200, 
      category: "footwear", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Handwoven comfortable sandals",
      sales_count: 9
    },
    { 
      id: "mock-6", 
      title: "Patterned Scarf", 
      price: 2400, 
      category: "accessories", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Beautiful patterned scarf with traditional design",
      sales_count: 15
    },
    { 
      id: "mock-7", 
      title: "Denim Jacket", 
      price: 8600, 
      category: "clothing", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Premium denim jacket with custom embroidery",
      sales_count: 7
    },
    { 
      id: "mock-8", 
      title: "Leather Boots", 
      price: 7500, 
      category: "footwear", 
      image_url: "/placeholder.svg",
      is_published: true,
      in_stock: true,
      description: "Durable leather boots for all terrains",
      sales_count: 11
    },
  ];

  // Query to get real products from database
  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        return data as Product[] || [];
      } catch (err) {
        console.error("Error fetching products:", err);
        return [];
      }
    },
  });

  // Combine database products with mock products
  const allProducts = [...(dbProducts || []), ...mockProducts];
  
  const filteredProducts = activeCategory === "all" 
    ? allProducts 
    : allProducts.filter(product => product.category === activeCategory);

  return (
    <MainLayout>
      <ShippingBanner />
      <div className="emerge-container py-8">
        <h1 className="emerge-heading text-4xl mb-8">Shop</h1>
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row">
            <select 
              className="block sm:hidden mb-4 p-2 border border-gray-300 rounded"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="all">ALL PRODUCTS</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <div className="hidden sm:flex flex-col space-y-2 w-64 mr-8">
              <button 
                onClick={() => setActiveCategory("all")}
                className={`text-left py-2 px-4 flex justify-between items-center ${
                  activeCategory === "all" ? "font-bold text-emerge-gold" : ""
                }`}
              >
                <span>ALL PRODUCTS</span>
                {activeCategory === "all" && <ChevronRight size={16} />}
              </button>
              
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`text-left py-2 px-4 flex justify-between items-center ${
                    activeCategory === category.id ? "font-bold text-emerge-gold" : ""
                  }`}
                >
                  <span>{category.name}</span>
                  {activeCategory === category.id && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
            
            <div className="flex-1">
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerge-gold border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-gray-500">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <Link 
                      to={`/shop/product/${product.id}`} 
                      key={product.id} 
                      className="group"
                    >
                      <div className="bg-gray-100 aspect-square mb-3 overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-gray-700">${(product.price / 100).toFixed(2)}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <Globe size={12} />
                        <span>International Shipping Available</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p>No products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8">
          <h2 className="emerge-heading text-2xl mb-4">About Our Products</h2>
          <p className="text-gray-700 max-w-3xl">
            Every item in our collection is designed and crafted by emerging African fashion talents. 
            We focus on sustainable materials, ethical production practices, and supporting local communities.
            By purchasing from Emerge International, you're directly supporting the growth and development 
            of Africa's fashion industry.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Shop;
