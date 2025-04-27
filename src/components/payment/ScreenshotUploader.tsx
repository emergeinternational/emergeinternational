
import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

interface ScreenshotUploaderProps {
  screenshot: string | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const ScreenshotUploader = ({ screenshot, onFileUpload, uploading }: ScreenshotUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileUpload}
      />
      
      <div className="border border-gray-300 p-4 rounded">
        {screenshot ? (
          <div className="relative">
            <img 
              src={screenshot} 
              alt="Payment confirmation" 
              className="w-full h-48 object-cover rounded"
            />
            <button 
              onClick={handleUploadClick}
              className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              disabled={uploading}
            >
              <Upload size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleUploadClick}
            className="w-full border-2 border-dashed border-gray-300 py-12 rounded flex flex-col items-center justify-center space-y-2 hover:border-emerge-gold transition-colors"
            disabled={uploading}
          >
            <Camera size={32} className="text-gray-400" />
            <span className="text-gray-600">
              {uploading ? "Uploading..." : "Upload Payment Screenshot"}
            </span>
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 text-center">
        Please upload a screenshot of your payment confirmation. 
        An administrator will review and approve your payment.
      </p>
    </div>
  );
};
