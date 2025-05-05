
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getProductById } from "../services/shopService";
import { ShopProduct } from "../types/shop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price / 100);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for could not be found.</p>
          <Button onClick={() => navigate("/shop")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/shop")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              {product.category && (
                <Badge className="mb-2">{product.category}</Badge>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Availability */}
            <div className="mb-8">
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-2 ${
                    product.in_stock ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                disabled={!product.in_stock}
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <div className="text-center text-sm text-gray-500">
                More features coming soon!
              </div>
            </div>
          </div>
        </div>

        {/* TODO: Product recommendations section */}
        {/* TODO: Reviews section */}
        {/* TODO: Recently viewed products */}
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
