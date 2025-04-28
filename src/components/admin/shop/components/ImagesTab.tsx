
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { ProductTabProps } from '../types/product-form';

export const ImagesTab: React.FC<ProductTabProps & {
  uploadingImage: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  formValues,
  isMockProduct,
  uploadingImage,
  handleImageUpload
}) => {
  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      <div className="flex items-center gap-4">
        {formValues.imageUrl && (
          <div className="relative h-32 w-32 rounded-md overflow-hidden border">
            <img
              src={formValues.imageUrl}
              alt="Product"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
        )}
        
        <div>
          <Label
            htmlFor="image-upload"
            className="cursor-pointer flex items-center gap-2 border rounded-md px-3 py-2 hover:bg-gray-100"
          >
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{formValues.imageUrl ? "Change Image" : "Upload Image"}</span>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          <p className="text-sm text-gray-500 mt-2">
            {isMockProduct 
              ? "This is a mock product. Image will be fully processed when converted to a real product."
              : "Recommended size: 800x800px. Max file size: 5MB."
            }
          </p>
        </div>
      </div>
    </div>
  );
};
