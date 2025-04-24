
import { Mail, User, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BasicInfoProps {
  formData: {
    full_name: string;
    email: string;
    country: string;
    city: string;
    language: string;
  };
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection = ({ formData, onChange }: BasicInfoProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-white mb-1">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => onChange('full_name', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-white mb-1">
            Country
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="country"
              type="text"
              value={formData.country}
              onChange={(e) => onChange('country', e.target.value)}
              className="emerge-input pl-10"
              placeholder="Enter your country"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-white mb-1">
            City
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="emerge-input pl-10"
              placeholder="Enter your city"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-white mb-1">
          Preferred Language
        </label>
        <Input
          id="language"
          type="text"
          value={formData.language}
          onChange={(e) => onChange('language', e.target.value)}
          className="emerge-input"
          placeholder="Enter your preferred language"
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
