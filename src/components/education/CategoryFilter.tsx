
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CourseCategory } from "@/types/education";
import { BookOpen, Camera, Brush, UsersRound, Video, Projector, Sparkles } from "lucide-react";

interface CategoryFilterProps {
  categories: CourseCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId?: string) => void;
}

const categoryIcons: Record<string, any> = {
  'Model': UsersRound,
  'Designer': Brush,
  'Actor': Projector,
  'Photographer': Camera,
  'Videographer': Video,
  'Social Media Influencer': Sparkles,
  'Entertainment Talent': BookOpen,
  'default': BookOpen
};

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          className={cn(
            "text-sm font-medium rounded-full transition-colors flex gap-2 items-center",
            !selectedCategory && "bg-emerge-gold text-white"
          )}
          onClick={() => onSelectCategory(undefined)}
        >
          <BookOpen className="h-4 w-4" />
          <span>All</span>
        </Button>
        
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.name] || categoryIcons.default;
          return (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "text-sm font-medium rounded-full transition-colors flex gap-2 items-center",
                selectedCategory === category.id && "bg-emerge-gold text-white"
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
