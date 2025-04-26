
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/types/education";
import { Download, Award } from "lucide-react";
import { format } from "date-fns";

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  // Check if it's a category mastery certificate (Emerge International Certificate)
  const isCategoryMastery = certificate.type === 'category';
  
  return (
    <Card className={`overflow-hidden border-${isCategoryMastery ? 'emerge-gold' : 'emerge-gold/50'} bg-emerge-darkBg`}>
      <CardHeader className={`${isCategoryMastery ? 'bg-emerge-gold/50' : 'bg-emerge-gold/20'} flex flex-row items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Award className={`h-5 w-5 ${isCategoryMastery ? 'text-white' : 'text-emerge-gold'}`} />
          <h3 className="font-medium text-white">{certificate.title}</h3>
        </div>
        <span className="text-xs text-gray-400">
          {format(new Date(certificate.issueDate), 'MMM d, yyyy')}
        </span>
      </CardHeader>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">
            {isCategoryMastery 
              ? 'Completed all courses in this category' 
              : 'Course Completion Certificate'
            }
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className={`border-${isCategoryMastery ? 'emerge-gold' : 'emerge-gold'} text-emerge-gold hover:bg-emerge-gold/20`}
          onClick={() => certificate.downloadUrl && window.open(certificate.downloadUrl, '_blank')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardContent>
    </Card>
  );
}
