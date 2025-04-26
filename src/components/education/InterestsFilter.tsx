
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface InterestsFilterProps {
  selectedInterest?: string;
  onSelectInterest: (interest?: string) => void;
}

export function InterestsFilter({
  selectedInterest,
  onSelectInterest
}: InterestsFilterProps) {
  const interests = [
    { id: 'model', label: 'Model' },
    { id: 'designer', label: 'Designer' },
    { id: 'stylist', label: 'Stylist' },
    { id: 'photographer', label: 'Photographer' },
    { id: 'actor', label: 'Actor' }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Career Interests</h3>
      <ToggleGroup 
        type="single" 
        value={selectedInterest} 
        onValueChange={(value) => onSelectInterest(value === selectedInterest ? undefined : value)}
        className="flex flex-wrap gap-2"
      >
        {interests.map((interest) => (
          <ToggleGroupItem 
            key={interest.id} 
            value={interest.id}
            className="border border-gray-700 hover:bg-emerge-gold/20 data-[state=on]:bg-emerge-gold data-[state=on]:text-white"
          >
            {interest.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
