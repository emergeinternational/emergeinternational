
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { EducationLevel } from "@/types/education";

interface LevelFilterProps {
  selectedLevel?: EducationLevel;
  onSelectLevel: (level?: EducationLevel) => void;
}

export function LevelFilter({ 
  selectedLevel, 
  onSelectLevel 
}: LevelFilterProps) {
  const levels: { value: EducationLevel; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Experience Level</h3>
      <ToggleGroup type="single" value={selectedLevel} onValueChange={(value: EducationLevel | undefined) => onSelectLevel(value)}>
        {levels.map((level) => (
          <ToggleGroupItem 
            key={level.value} 
            value={level.value}
            className="border border-gray-700 hover:bg-emerge-gold/20 data-[state=on]:bg-emerge-gold data-[state=on]:text-white"
          >
            {level.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
