
import { BookOpen } from "lucide-react";

interface EmptyEligibleUsersProps {
  minCoursesRequired: number;
  minWorkshopsRequired: number;
}

export const EmptyEligibleUsers = ({
  minCoursesRequired,
  minWorkshopsRequired
}: EmptyEligibleUsersProps) => {
  return (
    <div className="bg-emerge-cream p-8 text-center rounded-md">
      <BookOpen className="h-12 w-12 mx-auto mb-2 text-emerge-gold/60" />
      <h3 className="text-lg font-medium mb-1">No Eligible Users Found</h3>
      <p className="text-gray-600">
        Users need to complete at least {minCoursesRequired} online courses and {minWorkshopsRequired} workshops to be eligible.
      </p>
    </div>
  );
};
