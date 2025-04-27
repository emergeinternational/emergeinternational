
import { useState } from "react";
import { UploadCloud, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaymentProofUploaderProps {
  onFileSelected: (file: File) => void;
}

export const PaymentProofUploader = ({ onFileSelected }: PaymentProofUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // 5MB
    
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must not exceed ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="payment-proof" className="text-base font-medium block mb-2">
          Upload Payment Proof
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Please upload a screenshot of your payment confirmation.
          Maximum file size: 5MB. Supported formats: JPEG, PNG.
        </p>
      </div>
      
      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="payment-proof"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Label htmlFor="payment-proof" className="cursor-pointer block">
            <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <span className="text-sm font-medium text-emerge-gold block">
              Click to upload
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
              or drag and drop
            </span>
          </Label>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden">
          <img
            src={previewUrl || ""}
            alt="Payment proof preview"
            className="w-full h-auto max-h-[300px] object-contain"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleRemoveFile}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-green-50 p-3 text-green-700 text-sm flex items-center">
            <Check className="h-4 w-4 mr-2" />
            <span>{selectedFile.name} selected</span>
          </div>
        </div>
      )}
    </div>
  );
};
