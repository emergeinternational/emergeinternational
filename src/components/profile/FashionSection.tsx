
import { Shirt, Tag, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FashionProps {
  formData: {
    fashion_style: string;
    favorite_brands: string[];
    preferred_shopping_locations: string[];
    size_preferences: Record<string, any>;
  };
  onChange: (field: string, value: any) => void;
}

const FashionSection = ({ formData, onChange }: FashionProps) => {
  const handleArrayInput = (field: string, value: string) => {
    onChange(field, value.split(',').map(item => item.trim()));
  };

  const handleSizePreferences = (category: string, value: string) => {
    onChange('size_preferences', {
      ...formData.size_preferences,
      [category]: value
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white mb-4">Fashion Preferences</h2>
      
      <div>
        <label htmlFor="fashion_style" className="block text-sm font-medium text-white mb-1">
          Fashion Style
        </label>
        <div className="relative">
          <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="fashion_style"
            type="text"
            value={formData.fashion_style}
            onChange={(e) => onChange('fashion_style', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Describe your fashion style"
          />
        </div>
      </div>

      <div>
        <label htmlFor="favorite_brands" className="block text-sm font-medium text-white mb-1">
          Favorite Brands
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="favorite_brands"
            type="text"
            value={formData.favorite_brands?.join(', ')}
            onChange={(e) => handleArrayInput('favorite_brands', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Enter brands separated by commas"
          />
        </div>
      </div>

      <div>
        <label htmlFor="shopping_locations" className="block text-sm font-medium text-white mb-1">
          Preferred Shopping Locations
        </label>
        <div className="relative">
          <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="shopping_locations"
            type="text"
            value={formData.preferred_shopping_locations?.join(', ')}
            onChange={(e) => handleArrayInput('preferred_shopping_locations', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Enter locations separated by commas"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="clothes_size" className="block text-sm font-medium text-white mb-1">
            Clothes Size
          </label>
          <Input
            id="clothes_size"
            type="text"
            value={formData.size_preferences?.clothes || ''}
            onChange={(e) => handleSizePreferences('clothes', e.target.value)}
            className="emerge-input"
            placeholder="Enter your clothes size"
          />
        </div>
        <div>
          <label htmlFor="shoe_size" className="block text-sm font-medium text-white mb-1">
            Shoe Size
          </label>
          <Input
            id="shoe_size"
            type="text"
            value={formData.size_preferences?.shoes || ''}
            onChange={(e) => handleSizePreferences('shoes', e.target.value)}
            className="emerge-input"
            placeholder="Enter your shoe size"
          />
        </div>
      </div>
    </div>
  );
};

export default FashionSection;
