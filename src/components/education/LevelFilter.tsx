
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { EducationLevel } from "@/types/education";
import { GraduationCap, BookOpen, School } from "lucide-react";

interface LevelFilterProps {
  selectedLevel?: EducationLevel;
  onSelectLevel: (level?: EducationLevel) => void;
}

export function LevelFilter({ 
  selectedLevel, 
  onSelectLevel 
}: LevelFilterProps) {
  const levels: { value: EducationLevel; label: string; icon: any }[] = [
    { value: 'beginner', label: 'Beginner', icon: BookOpen },
    { value: 'intermediate', label: 'Intermediate', icon: School },
    { value: 'advanced', label: 'Advanced', icon: GraduationCap }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Experience Level</h3>
      <ToggleGroup 
        type="single" 
        value={selectedLevel} 
        onValueChange={(value: EducationLevel | undefined) => onSelectLevel(value)}
        className="flex flex-wrap gap-2"
      >
        {levels.map((level) => {
          const IconComponent = level.icon;
          return (
            <ToggleGroupItem 
              key={level.value} 
              value={level.value}
              className="border border-gray-700 hover:bg-emerge-gold/20 data-[state=on]:bg-emerge-gold data-[state=on]:text-white flex gap-2 items-center"
            >
              <IconComponent className="h-4 w-4" />
              {level.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
