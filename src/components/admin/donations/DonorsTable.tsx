
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DonorsTableProps {
  donors: any[];
  isLoading: boolean;
}

const DonorsTable = ({ donors, isLoading }: DonorsTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading donor data...</p>
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-gray-500">No donors found</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDonorTier = (amount: number) => {
    if (amount >= 5000) {
      return <Badge className="bg-emerge-gold text-black">Platinum</Badge>;
    } else if (amount >= 1000) {
      return <Badge className="bg-gray-300 text-gray-800">Silver</Badge>;
    } else if (amount >= 500) {
      return <Badge className="bg-amber-100 text-amber-800">Bronze</Badge>;
    } else {
      return <Badge variant="outline">Supporter</Badge>;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Donations</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Last Donation</TableHead>
            <TableHead>Donor Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donors.map((donor) => (
            <TableRow key={donor.user_id}>
              <TableCell className="font-medium">{donor.full_name}</TableCell>
              <TableCell>{donor.email}</TableCell>
              <TableCell>{donor.phone_number || "N/A"}</TableCell>
              <TableCell>{donor.donation_count}</TableCell>
              <TableCell className="font-medium">{formatCurrency(donor.total_amount)}</TableCell>
              <TableCell>{formatDate(donor.last_donation_date)}</TableCell>
              <TableCell>{getDonorTier(donor.total_amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DonorsTable;
