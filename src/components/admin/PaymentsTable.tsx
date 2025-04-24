
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
          <TableHead>Name</TableHead>
          <TableHead>City</TableHead>
          <TableHead>REF ID</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.name}</TableCell>
            <TableCell>{payment.city}</TableCell>
            <TableCell>{payment.id}</TableCell>
            <TableCell>
              <button
                onClick={() => onActivate(payment.id)}
                className="bg-emerge-darkBg text-white px-4 py-1 text-sm rounded hover:bg-emerge-gold transition-colors"
              >
                ACTIVATE
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PaymentsTable;
