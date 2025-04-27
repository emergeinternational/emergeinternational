
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Clock, XCircle } from "lucide-react";

interface CertificateStatusFilterProps {
  currentStatus: 'all' | 'pending' | 'approved' | 'denied';
  onChange: (status: 'all' | 'pending' | 'approved' | 'denied') => void;
  counts: {
    pending: number;
    approved: number;
    denied: number;
  };
}

const CertificateStatusFilter = ({ 
  currentStatus, 
  onChange,
  counts 
}: CertificateStatusFilterProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={currentStatus === 'all' ? "default" : "outline"}
        onClick={() => onChange('all')}
        className="flex items-center gap-2"
      >
        All
        <Badge variant="secondary">
          {counts.pending + counts.approved + counts.denied}
        </Badge>
      </Button>
      
      <Button
        variant={currentStatus === 'pending' ? "default" : "outline"}
        onClick={() => onChange('pending')}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        Pending
        <Badge variant="secondary">{counts.pending}</Badge>
      </Button>
      
      <Button
        variant={currentStatus === 'approved' ? "default" : "outline"}
        onClick={() => onChange('approved')}
        className="flex items-center gap-2 text-green-600"
      >
        <UserCheck className="h-4 w-4" />
        Approved
        <Badge variant="secondary">{counts.approved}</Badge>
      </Button>
      
      <Button
        variant={currentStatus === 'denied' ? "default" : "outline"}
        onClick={() => onChange('denied')}
        className="flex items-center gap-2 text-red-600"
      >
        <XCircle className="h-4 w-4" />
        Denied
        <Badge variant="secondary">{counts.denied}</Badge>
      </Button>
    </div>
  );
};

export default CertificateStatusFilter;
