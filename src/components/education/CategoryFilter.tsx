
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CourseCategory } from "@/types/education";

interface CategoryFilterProps {
  categories: CourseCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId?: string) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant="ghost"
        className={cn(
          "text-sm font-medium transition-colors",
          !selectedCategory && "bg-emerge-gold text-white"
        )}
        onClick={() => onSelectCategory(undefined)}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          className={cn(
            "text-sm font-medium transition-colors",
            selectedCategory === category.id && "bg-emerge-gold text-white"
          )}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
