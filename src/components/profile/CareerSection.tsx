
import { Briefcase, Building2, Link } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CareerProps {
  formData: {
    profession: string;
    industry: string;
    linkedin_url: string;
  };
  onChange: (field: string, value: string) => void;
}

const CareerSection = ({ formData, onChange }: CareerProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white mb-4">Career Information</h2>
      
      <div>
        <label htmlFor="profession" className="block text-sm font-medium text-white mb-1">
          Profession
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="profession"
            type="text"
            value={formData.profession}
            onChange={(e) => onChange('profession', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Enter your profession"
          />
        </div>
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-white mb-1">
          Industry
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="industry"
            type="text"
            value={formData.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Enter your industry"
          />
        </div>
      </div>

      <div>
        <label htmlFor="linkedin_url" className="block text-sm font-medium text-white mb-1">
          LinkedIn Profile
        </label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="linkedin_url"
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => onChange('linkedin_url', e.target.value)}
            className="emerge-input pl-10"
            placeholder="Enter your LinkedIn profile URL"
          />
        </div>
      </div>
    </div>
  );
};

export default CareerSection;
