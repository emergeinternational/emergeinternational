
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { EmergingTalentRow } from "./EmergingTalentRow";
import { EmergingTalent } from "@/hooks/useEmergingTalents";

interface EmergingTalentTableProps {
  submissions: EmergingTalent[];
  isLoading: boolean;
  isRefreshing: boolean;
}

export const EmergingTalentTable = ({ 
  submissions, 
  isLoading, 
  isRefreshing 
}: EmergingTalentTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Social Media</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading || isRefreshing ? (
          <TableRow>
            <td colSpan={7} className="text-center py-8">
              Loading submissions...
            </td>
          </TableRow>
        ) : !submissions?.length ? (
          <TableRow>
            <td colSpan={7} className="text-center py-8">
              No submissions found
            </td>
          </TableRow>
        ) : (
          submissions.map((submission) => (
            <EmergingTalentRow key={submission.id} submission={submission} />
          ))
        )}
      </TableBody>
    </Table>
  );
};
