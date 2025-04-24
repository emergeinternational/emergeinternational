import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { ChevronRight } from "lucide-react";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = [
    { id: "new", name: "New Arrivals" },
    { id: "clothing", name: "Clothing" },
    { id: "footwear", name: "Footwear" },
    { id: "accessories", name: "Accessories" },
  ];
  
  const products = [
    { id: 1, name: "Emerge T-Shirt", price: "ETB 4,800", category: "clothing", image: "/placeholder.svg" },
    { id: 2, name: "Designer Earrings", price: "ETB 12,500", category: "accessories", image: "/placeholder.svg" },
    { id: 3, name: "Leather Bag", price: "ETB 4,800", category: "accessories", image: "/placeholder.svg" },
    { id: 4, name: "Tailored Coat", price: "ETB 12,500", category: "clothing", image: "/placeholder.svg" },
    { id: 5, name: "Woven Sandals", price: "ETB 3,200", category: "footwear", image: "/placeholder.svg" },
    { id: 6, name: "Patterned Scarf", price: "ETB 2,400", category: "accessories", image: "/placeholder.svg" },
    { id: 7, name: "Denim Jacket", price: "ETB 8,600", category: "clothing", image: "/placeholder.svg" },
    { id: 8, name: "Leather Boots", price: "ETB 7,500", category: "footwear", image: "/placeholder.svg" },
  ];

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <MainLayout>
      <div className="emerge-container py-8">
        <h1 className="emerge-heading text-4xl mb-8">Shop</h1>
        
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row">
            {/* Mobile Category Selector */}
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
            
            {/* Desktop Categories */}
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
            
            {/* Products Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <Link 
                    to={`/shop/product/${product.id}`} 
                    key={product.id} 
                    className="group"
                  >
                    <div className="bg-gray-100 aspect-square mb-3 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-gray-700">{product.price}</p>
                  </Link>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p>No products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
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
