
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Instagram } from "lucide-react";

interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  skills: string[] | null;
  experience_years: number | null;
  portfolio_url: string | null;
  social_media: {
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  } | null;
  status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  notes: string | null;
  created_at: string;
  country: string | null;
  age: number | null;
  category_type: string | null;
  photo_url: string | null;
  gender: string | null;
}

interface TalentDetailsDialogProps {
  application: TalentApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TalentDetailsDialog = ({
  application,
  open,
  onOpenChange
}: TalentDetailsDialogProps) => {
  if (!application) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Review the complete application information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              {application.photo_url ? (
                <AvatarImage src={application.photo_url} alt={application.full_name} />
              ) : (
                <AvatarFallback>{application.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{application.full_name}</h3>
              <p className="text-sm text-gray-500">
                {application.category_type || 'Category not specified'}
                {application.gender && ` (${application.gender})`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Personal Information</h3>
              <div className="space-y-2 mt-2">
                <p>Age: {application.age || 'Not specified'}</p>
                <p>Gender: {application.gender || 'Not specified'}</p>
                <p>Country: {application.country || 'Not specified'}</p>
                <p>Email: {application.email}</p>
                {application.phone && (
                  <p>Phone: {application.phone}</p>
                )}
                {application.social_media && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Social Media</h4>
                    {application.social_media.instagram && (
                      <a
                        href={`https://instagram.com/${application.social_media.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-emerge-gold hover:underline"
                      >
                        <Instagram className="h-4 w-4 mr-1" />
                        {application.social_media.instagram}
                      </a>
                    )}
                    {application.social_media.tiktok && (
                      <p className="text-sm">
                        TikTok: {application.social_media.tiktok}
                      </p>
                    )}
                    {application.social_media.telegram && (
                      <p className="text-sm">
                        Telegram: {application.social_media.telegram}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Professional Details</h3>
              <div className="space-y-2 mt-2">
                <p>Experience: {application.experience_years || 'N/A'} years</p>
                {application.portfolio_url && (
                  <p>
                    <a 
                      href={application.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerge-gold hover:underline inline-flex items-center"
                    >
                      Portfolio <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {application.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-700">{application.notes}</p>
            </div>
          )}

          {application.skills && (
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TalentDetailsDialog;
