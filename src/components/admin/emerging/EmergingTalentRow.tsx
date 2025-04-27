
import { TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { EmergingTalent } from "@/hooks/useEmergingTalents";

interface EmergingTalentRowProps {
  submission: EmergingTalent;
}

export const EmergingTalentRow = ({ submission }: EmergingTalentRowProps) => {
  return (
    <TableRow key={submission.id}>
      <TableCell className="font-medium">
        <div>
          {submission.full_name}
          <div className="text-sm text-gray-500">
            Submitted on {format(new Date(submission.created_at), "PPp")}
          </div>
        </div>
      </TableCell>
      <TableCell>{submission.category}</TableCell>
      <TableCell>{submission.gender}</TableCell>
      <TableCell>{submission.age}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm">{submission.email}</div>
          {submission.phone_number && (
            <div className="text-sm text-gray-500">{submission.phone_number}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {submission.instagram && (
            <div className="text-sm">Instagram: {submission.instagram}</div>
          )}
          {submission.telegram && (
            <div className="text-sm">Telegram: {submission.telegram}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="text-sm truncate max-w-xs">
            {submission.talent_description}
          </div>
          {submission.category === "Model" && submission.measurements && (
            <div className="text-xs text-gray-500">
              Measurements provided
            </div>
          )}
          {submission.category === "Designer" && submission.portfolio_url && (
            <a 
              href={submission.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              View Portfolio
            </a>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
