
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  country: string;
  category_type: string;
  status: string;
  phone?: string;
  age?: number;
  height?: number;
  weight?: number;
  dress_size?: string;
  experience_years?: number;
  experience_level?: string;
  demo_reel_url?: string;
  portfolio_url?: string;
  created_at: string;
  [key: string]: any;
}

interface TalentDetailsDialogProps {
  talent: TalentApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLocked?: boolean;
}

const TalentDetailsDialog: React.FC<TalentDetailsDialogProps> = ({
  talent,
  open,
  onOpenChange,
  isLocked = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Talent Application: {talent.full_name}</span>
            <Badge className={`
              ${talent.status === 'approved' ? 'bg-green-500' : 
                talent.status === 'rejected' ? 'bg-red-500' : 
                'bg-amber-500'}`
            }>
              {talent.status?.charAt(0).toUpperCase() + talent.status?.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted on {new Date(talent.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Full Name:</div>
              <div>{talent.full_name}</div>
              
              <div className="text-sm text-muted-foreground">Email:</div>
              <div>{talent.email}</div>
              
              <div className="text-sm text-muted-foreground">Phone:</div>
              <div>{talent.phone || 'N/A'}</div>
              
              <div className="text-sm text-muted-foreground">Country:</div>
              <div>{talent.country}</div>
              
              <div className="text-sm text-muted-foreground">Category:</div>
              <div>{talent.category_type}</div>
              
              <div className="text-sm text-muted-foreground">Age:</div>
              <div>{talent.age || 'N/A'}</div>
            </div>
          </div>

          {(talent.category_type === 'model' || talent.category_type === 'performer') && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Physical Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Height:</div>
                <div>{talent.height ? `${talent.height} cm` : 'N/A'}</div>
                
                <div className="text-sm text-muted-foreground">Weight:</div>
                <div>{talent.weight ? `${talent.weight} kg` : 'N/A'}</div>
                
                <div className="text-sm text-muted-foreground">Dress Size:</div>
                <div>{talent.dress_size || 'N/A'}</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Experience</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Experience:</div>
              <div>{talent.experience_years ? `${talent.experience_years} years` : 'N/A'}</div>
              
              <div className="text-sm text-muted-foreground">Level:</div>
              <div>{talent.experience_level || 'N/A'}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Portfolio</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Demo Reel:</div>
              <div>
                {talent.demo_reel_url ? (
                  <a href={talent.demo_reel_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    View Demo Reel
                  </a>
                ) : 'N/A'}
              </div>
              
              <div className="text-sm text-muted-foreground">Portfolio:</div>
              <div>
                {talent.portfolio_url ? (
                  <a href={talent.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    View Portfolio
                  </a>
                ) : 'N/A'}
              </div>
            </div>
          </div>

          {talent.social_media && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-medium text-lg">Social Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {typeof talent.social_media === 'object' ? Object.entries(talent.social_media).map(([platform, url]) => (
                  url && (
                    <React.Fragment key={platform}>
                      <div className="text-sm text-muted-foreground capitalize">{platform}:</div>
                      <div>
                        <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {url as string}
                        </a>
                      </div>
                    </React.Fragment>
                  )
                )) : (
                  <div className="col-span-4">Social media information not available</div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isLocked && talent.status === 'pending' && (
            <>
              <Button variant="destructive" className="mr-2">
                Reject Application
              </Button>
              <Button>
                Approve Application
              </Button>
            </>
          )}
          {isLocked && (
            <div className="text-sm text-amber-500">
              Page is locked. Unlock to perform actions.
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TalentDetailsDialog;
