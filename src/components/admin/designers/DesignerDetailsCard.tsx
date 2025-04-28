
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Designer } from "@/services/designerTypes";
import { X, Edit, ExternalLink, Instagram, Globe } from "lucide-react";

interface DesignerDetailsCardProps {
  designer: Designer;
  onEdit: () => void;
  onClose: () => void;
}

const DesignerDetailsCard = ({ designer, onEdit, onClose }: DesignerDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onClose}
        >
          <X size={18} />
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {designer.image_url && (
            <div className="w-24 h-24 rounded-full overflow-hidden border">
              <img 
                src={designer.image_url} 
                alt={designer.full_name} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {designer.full_name}
              {designer.featured && (
                <Badge variant="secondary" className="ml-2">Featured</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {designer.email}
            </p>
            <div className="mt-2">
              <Badge className="capitalize">{designer.specialty}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 mt-4">
        {designer.bio && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
            <p className="text-sm">{designer.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Links</h3>
            <div className="space-y-2">
              {designer.portfolio_url && (
                <a href={designer.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <ExternalLink size={14} />
                  Portfolio
                </a>
              )}
              
              {designer.social_media?.instagram && (
                <a href={`https://instagram.com/${designer.social_media.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <Instagram size={14} />
                  @{designer.social_media.instagram}
                </a>
              )}

              {designer.social_media?.website && (
                <a href={designer.social_media.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <Globe size={14} />
                  Website
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Sales Statistics</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Products: </span>
                {designer.products?.length || 0}
              </p>
              <p className="text-sm">
                <span className="font-medium">Sales: </span>
                {designer.sales_count || 0}
              </p>
              <p className="text-sm">
                <span className="font-medium">Revenue: </span>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(designer.revenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
          <Edit size={16} />
          Edit Designer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DesignerDetailsCard;
