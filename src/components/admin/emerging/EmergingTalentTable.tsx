
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { EmergingTalentRow } from "./EmergingTalentRow";

interface EmergingTalent {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  age: number | null;
  category: string;
  gender: string;
  instagram: string | null;
  telegram: string | null;
  talent_description: string | null;
  measurements: Record<string, string> | null;
  portfolio_url: string | null;
  created_at: string;
}

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
