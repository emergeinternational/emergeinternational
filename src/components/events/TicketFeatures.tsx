
import { Badge } from "@/components/ui/badge";

interface TicketFeaturesProps {
  features: string[];
}

export const TicketFeatures: React.FC<TicketFeaturesProps> = ({ features }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature, index) => (
        <Badge key={index} variant="secondary">
          {feature}
        </Badge>
      ))}
    </div>
  );
};
