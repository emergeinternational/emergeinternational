
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface EmptyCourseStateProps {
  onClearFilters: () => void;
}

export function EmptyCourseState({ onClearFilters }: EmptyCourseStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-emerge-cream/10 rounded-lg border border-gray-800">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-emerge-gold/20 p-4">
          <BookOpen className="h-10 w-10 text-emerge-gold" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">No courses found</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        We're constantly adding new courses to our platform. Try adjusting your filters or check back soon for new content.
      </p>
      <Button onClick={onClearFilters} variant="outline" className="border-emerge-gold text-emerge-gold hover:bg-emerge-gold/20">
        Clear All Filters
      </Button>
    </div>
  );
}
