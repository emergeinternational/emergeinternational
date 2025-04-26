
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EducationLevel } from "@/types/education";

const levels: { value: EducationLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface LevelFilterProps {
  selectedLevel?: EducationLevel;
  onSelectLevel: (level?: EducationLevel) => void;
}

export function LevelFilter({ selectedLevel, onSelectLevel }: LevelFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors",
          !selectedLevel && "bg-emerge-gold text-white"
        )}
        onClick={() => onSelectLevel(undefined)}
      >
        All Levels
      </Button>
      {levels.map((level) => (
        <Button
          key={level.value}
          variant="ghost"
          className={cn(
            "text-sm font-medium transition-colors",
            selectedLevel === level.value && "bg-emerge-gold text-white"
          )}
          onClick={() => onSelectLevel(level.value)}
        >
          {level.label}
        </Button>
      ))}
    </div>
  );
}
