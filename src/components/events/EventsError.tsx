
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const EventsError = ({ error }: { error: Error }) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading events</AlertTitle>
      <AlertDescription>
        {error.message || "Please try again later"}
      </AlertDescription>
    </Alert>
  );
};
