
import { Mail, Phone, Instagram, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ContactProps {
  formData: {
    email: string;
    phone_number: string;
    social_media_handle: string;
    telegram_name: string;
  };
  onChange: (field: string, value: string) => void;
}

const ContactSection = ({ formData, onChange }: ContactProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="emerge-input pl-10"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-white mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => onChange('phone_number', e.target.value)}
              className="emerge-input pl-10"
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="social_media_handle" className="block text-sm font-medium text-white mb-1">
            Social Media Handle
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="social_media_handle"
              type="text"
              value={formData.social_media_handle}
              onChange={(e) => onChange('social_media_handle', e.target.value)}
              className="emerge-input pl-10"
              placeholder="Enter your social media handle"
            />
          </div>
        </div>

        <div>
          <label htmlFor="telegram_name" className="block text-sm font-medium text-white mb-1">
            Telegram Username
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="telegram_name"
              type="text"
              value={formData.telegram_name}
              onChange={(e) => onChange('telegram_name', e.target.value)}
              className="emerge-input pl-10"
              placeholder="Enter your Telegram username"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
