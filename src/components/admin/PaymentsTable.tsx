
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  name: string;
  city: string;
  status: string;
}

interface PaymentsTableProps {
  payments: Payment[];
  onActivate: (id: string) => void;
}

const PaymentsTable = ({ payments, onActivate }: PaymentsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.id}</TableCell>
            <TableCell>{payment.name}</TableCell>
            <TableCell>{payment.city}</TableCell>
            <TableCell>{payment.status}</TableCell>
            <TableCell>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => onActivate(payment.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Activate
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PaymentsTable;
